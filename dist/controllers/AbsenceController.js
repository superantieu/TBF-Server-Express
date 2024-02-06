"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const datetime_utils_1 = __importDefault(require("../utils/datetime.utils"));
const holiday_utils_1 = __importDefault(require("../utils/holiday.utils"));
const mail_utils_1 = __importDefault(require("../utils/mail.utils"));
const sql_utils_1 = __importDefault(require("../utils/sql.utils"));
const task_constant_1 = require("../constants/task.constant");
class AbsenceController {
    static createAbsence(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { toManager, cc, leaveType, fromDate, toDate, fromSession, toSession, reason, handler, totalDays, } = req.body;
                const toUser = yield sql_utils_1.default.selectUserById(req.app.locals.db, toManager.value);
                const wipProjects = yield sql_utils_1.default.selectUserWIPProjects(req.app.locals.db, user.UserId);
                const userSend = yield sql_utils_1.default.selectUserById(req.app.locals.db, user.UserId);
                //Email payload
                const subject = `TBF | ${luxon_1.DateTime.now().toFormat("yyyyMMdd")}_${leaveType.label.toUpperCase()} | ${user.UserId}-${user.FullName.toUpperCase()} | ${user.Discipline.toUpperCase()} ${user.JobTitle.toUpperCase()}`;
                const content = `<div>Dear ${toUser.Sex === "Male" ? "Mr" : "Ms"} ${toUser.FullName},<br/> Can you please approve my leave request as per details below?<br/><br/><b>${leaveType.label}:</b>(${totalDays}) day(s)<br/>&emsp;from:&emsp;${fromDate},${fromSession.label}<br/>&emsp;to:&emsp;&emsp;${toDate},${toSession.label}<br/><b>Reason:</b>${reason}<br/><b>Handler:</b>${handler.label}<br/><b>WIP Projects:</b><br/>${wipProjects.length > 0
                    ? (wipProjects.map((p) => `${p.ProjectName}<br/>`) + "")
                        .split(",")
                        .join("")
                    : "I have completed all the assigned projects."}<br/>Looking forward for your approval. Thank you.<br/><br/>
      Sincerely,<br/><b>${user.FullName}</b></div>`;
                //Send mail
                const handlerUser = yield sql_utils_1.default.selectUserById(req.app.locals.db, handler.value);
                const hrUser = yield sql_utils_1.default.selectUserByEmail(req.app.locals.db, "hr@the-bim-factory.com");
                const ccIds = cc
                    .map((e) => Number(e.value))
                    .filter((e) => e !== 0 &&
                    e !== toUser.UserId &&
                    e !== handlerUser.UserId);
                const ccUsers = yield sql_utils_1.default.selectUsersByIds(req.app.locals.db, ccIds);
                const ccEmails = ccUsers.map((user) => user.Email);
                let allCCEmails = [
                    ...ccEmails,
                    handlerUser.Email,
                    userSend.Email,
                ];
                const ccList = [
                    "hr@the-bim-factory.com",
                    "admin@the-bim-factory.com",
                    ...allCCEmails.map((email) => `${email}`),
                ];
                // Insert to DB
                const payload = {
                    UserId: user.UserId,
                    ToEmail: toUser.Email,
                    CCEmails: (allCCEmails + "").split(",").join(";"),
                    SentDate: new Date(Date.now()) // + 3600 * 1000 * 7
                        .toISOString()
                        .slice(0, 19)
                        .replace("T", " "),
                    LeaveType: leaveType.label,
                    LeaveFrom: new Date(new Date(fromDate).getTime())
                        .toISOString()
                        .slice(0, 19)
                        .replace("T", " "),
                    LeaveTimeFrom: fromSession.label,
                    LeaveTo: new Date(new Date(toDate).getTime())
                        .toISOString()
                        .slice(0, 19)
                        .replace("T", " "),
                    LeaveTimeTo: toSession.label,
                    CountDays: `(${totalDays} day(s))`,
                    Reason: reason,
                    HandlerId: handlerUser.UserId,
                    ProjectNotComplete: wipProjects.length > 0
                        ? (wipProjects.map((p) => p.ProjectName) + "")
                            .split(",")
                            .join(" : ")
                        : "I have completed all the assigned projects.",
                    Approved: 0,
                    Subject: subject,
                    MailId: "",
                };
                yield sql_utils_1.default.insertLeaveRequest(req.app.locals.db, payload);
                const idsToNotification = [
                    ...ccIds,
                    handlerUser.UserId,
                    hrUser.UserId,
                    toUser.UserId,
                ];
                for (let i = 0; i < idsToNotification.length; i++) {
                    const id = idsToNotification[i];
                    const msg = `${user.FullName} want to leave from ${fromDate} ${fromSession.label} to ${toDate} ${toSession.label} because ${reason}. Handler: ${handler.label}`;
                    yield sql_utils_1.default.insertNotifications(req.app.locals.db, {
                        Timestamp: new Date(Date.now())
                            .toISOString()
                            .slice(0, 19)
                            .replace("T", " "),
                        UserId: id,
                        Type: "Leave",
                        Msg: msg,
                        IsRead: 0,
                    });
                }
                const mailUtils = new mail_utils_1.default();
                yield mailUtils.sendEmail(
                // ["chuong.do@the-bim-factory.com"],
                // ["chuong.do@the-bim-factory.com"],
                [toUser.Email], ccList, subject, content);
                return res.status(200).json({ message: "Leave resquest sent" });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static getLeaveRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const findUser = yield sql_utils_1.default.selectUserById(req.app.locals.db, user.UserId);
                if (!findUser) {
                    return res.status(404).json({ message: "User not found!" });
                }
                const requestList = yield sql_utils_1.default.selectUserLeaveRequest(req.app.locals.db, findUser.Email
                // "jk.pascasio@the-bim-factory.com"
                );
                const ids = requestList.map((x) => x.UserId);
                const users = yield sql_utils_1.default.selectUsersByIds(req.app.locals.db, ids);
                const userInfos = users.map((x) => ({
                    UserId: x.UserId,
                    FullName: x.FullName,
                    JobTitle: x.JobTitle,
                    Discipline: x.Discipline,
                }));
                const result = requestList.map((x) => (Object.assign(Object.assign({}, x), { User: userInfos.find((e) => e.UserId === x.UserId) })));
                return res.status(200).json({
                    message: "Get leave request success!",
                    data: result,
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static approveLeaveRequest(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, isApproved } = req.body;
                if (typeof isApproved !== "boolean" || !id) {
                    return res.status(406).json({ message: "Missing data" });
                }
                const findRequest = yield sql_utils_1.default.selectLeaveRequestById(req.app.locals.db, id);
                if (!findRequest) {
                    return res
                        .status(404)
                        .json({ message: "Not found leave request" });
                }
                const { LeaveType, CountDays, LeaveFrom, LeaveTo, LeaveTimeFrom, LeaveTimeTo } = findRequest, rest = __rest(findRequest, ["LeaveType", "CountDays", "LeaveFrom", "LeaveTo", "LeaveTimeFrom", "LeaveTimeTo"]);
                const numberDay = Number(CountDays.split(" ")[0].replace("(", "")); // OK
                const findUser = yield sql_utils_1.default.selectUserById(req.app.locals.db, rest.UserId);
                if (!findUser) {
                    res.status(404).json({
                        message: "Not found user to update timesheet",
                    });
                }
                let projectRule = "Member";
                if ((_a = findUser.JobTitle) === null || _a === void 0 ? void 0 : _a.includes(`Leader`)) {
                    projectRule = "Leader";
                }
                else if ((_b = findUser.JobTitle) === null || _b === void 0 ? void 0 : _b.includes(`Manager`)) {
                    projectRule = "Manager";
                }
                else {
                    projectRule = "Member";
                }
                if (numberDay < 1) {
                    yield sql_utils_1.default.insertTimesheet(req.app.locals.db, {
                        TaskId: task_constant_1.CLeaveTypeTaskId[LeaveType],
                        ProjectId: "TBF-000-LEAVE",
                        UserId: findUser.UserId,
                        UserDiscipline: findUser.Discipline,
                        ProjectRule: projectRule,
                        TSDate: new Date(LeaveFrom).toISOString(),
                        TSHour: 4,
                        Adjustments: 0,
                        Autoload: Date.now().toLocaleString(),
                    });
                }
                else if (numberDay > 0) {
                    if (Number.isInteger(numberDay)) {
                        for (let i = 0; i < numberDay; i++) {
                            const tsDate = new Date(LeaveFrom).getTime() +
                                i * (24 * 3600 * 1000);
                            yield sql_utils_1.default.insertTimesheet(req.app.locals.db, {
                                TaskId: task_constant_1.CLeaveTypeTaskId[LeaveType],
                                ProjectId: "TBF-000-LEAVE",
                                UserId: findUser.UserId,
                                UserDiscipline: findUser.Discipline,
                                ProjectRule: projectRule,
                                TSDate: new Date(tsDate).toISOString(),
                                TSHour: 8,
                                Adjustments: 0,
                                Autoload: Date.now().toLocaleString(),
                            });
                        }
                    }
                    else {
                        if (LeaveTimeFrom === "Afternoon") {
                            yield sql_utils_1.default.insertTimesheet(req.app.locals.db, {
                                TaskId: task_constant_1.CLeaveTypeTaskId[LeaveType],
                                ProjectId: "TBF-000-LEAVE",
                                UserId: findUser.UserId,
                                UserDiscipline: findUser.Discipline,
                                ProjectRule: projectRule,
                                TSDate: new Date(LeaveFrom).toISOString(),
                                TSHour: 4,
                                Adjustments: 0,
                                Autoload: Date.now().toLocaleString(),
                            });
                            for (let i = 1; i < numberDay; i++) {
                                const tsDate = new Date(LeaveFrom).getTime() +
                                    i * (24 * 3600 * 1000);
                                yield sql_utils_1.default.insertTimesheet(req.app.locals.db, {
                                    TaskId: task_constant_1.CLeaveTypeTaskId[LeaveType],
                                    ProjectId: "TBF-000-LEAVE",
                                    UserId: findUser.UserId,
                                    UserDiscipline: findUser.Discipline,
                                    ProjectRule: projectRule,
                                    TSDate: new Date(tsDate).toISOString(),
                                    TSHour: 8,
                                    Adjustments: 0,
                                    Autoload: Date.now().toLocaleString(),
                                });
                            }
                        }
                        else {
                            for (let i = 0; i < numberDay - 1; i++) {
                                const tsDate = new Date(LeaveFrom).getTime() +
                                    i * (24 * 3600 * 1000);
                                yield sql_utils_1.default.insertTimesheet(req.app.locals.db, {
                                    TaskId: task_constant_1.CLeaveTypeTaskId[LeaveType],
                                    ProjectId: "TBF-000-LEAVE",
                                    UserId: findUser.UserId,
                                    UserDiscipline: findUser.Discipline,
                                    ProjectRule: projectRule,
                                    TSDate: new Date(tsDate).toISOString(),
                                    TSHour: 8,
                                    Adjustments: 0,
                                    Autoload: Date.now().toLocaleString(),
                                });
                            }
                            yield sql_utils_1.default.insertTimesheet(req.app.locals.db, {
                                TaskId: task_constant_1.CLeaveTypeTaskId[LeaveType],
                                ProjectId: "TBF-000-LEAVE",
                                UserId: findUser.UserId,
                                UserDiscipline: findUser.Discipline,
                                ProjectRule: projectRule,
                                TSDate: new Date(LeaveTo).toISOString(),
                                TSHour: 4,
                                Adjustments: 0,
                                Autoload: Date.now().toLocaleString(),
                            });
                        }
                    }
                }
                else {
                    return res.status(403).json({
                        message: "Approve not success!",
                        data: "",
                    });
                }
                yield sql_utils_1.default.updateLeaveRequest(req.app.locals.db, id, isApproved ? 1 : 2);
                return res.status(200).json({
                    message: "Approve success!",
                    data: "",
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static checkAbsence(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fromDate, toDate, fromSession, toSession } = req.body;
                const holidays = yield sql_utils_1.default.selectAllHolidays(req.app.locals.db);
                const holidayUtils = new holiday_utils_1.default(holidays);
                const fromDateLocal = luxon_1.DateTime.fromISO(fromDate).toLocaleString();
                const toDateLocal = luxon_1.DateTime.fromISO(toDate).toLocaleString();
                try {
                    const dateRange = datetime_utils_1.default.getDatesInRange(fromDateLocal, toDateLocal);
                    const filterNotWorkingDay = dateRange.filter((date) => {
                        let isWorkingDay = datetime_utils_1.default.isWorkingDay(date.toLocaleString(), process.env.WORKINGDAY_SATURDAY);
                        return isWorkingDay;
                    });
                    const filterDateByHolidays = filterNotWorkingDay.filter((date) => {
                        let isHoliday = holidayUtils.isHoliday(luxon_1.DateTime.fromJSDate(date).toFormat("yyyyMMdd"));
                        return !isHoliday;
                    });
                    let totalDay = filterDateByHolidays.length;
                    if (totalDay === 1 &&
                        fromSession.label === "Afternoon" &&
                        toSession.label === "Morning") {
                        return res.status(406).json({
                            message: "Input time session error (Morning -> Afternoon), please check it",
                        });
                    }
                    if (fromSession.label === "Afternoon") {
                        totalDay = totalDay - 0.5;
                    }
                    if (toSession.label === "Morning") {
                        totalDay = totalDay - 0.5;
                    }
                    return res.status(200).json({
                        message: "Absence request success!",
                        data: totalDay,
                    });
                }
                catch (error) {
                    return res.status(500).json({
                        message: "The days input is not correct, please check it",
                    });
                }
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
}
exports.default = AbsenceController;
