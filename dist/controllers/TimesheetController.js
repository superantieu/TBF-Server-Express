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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sql_utils_1 = __importDefault(require("../utils/sql.utils"));
class TimesheetController {
    static getUserTimesheet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { date } = req.query;
                const time = yield sql_utils_1.default.selectUserTimesheet(req.app.locals.db, String(date), Number(id));
                return res.status(200).json({
                    message: "Get timesheet success!",
                    data: time.length < 1
                        ? 0
                        : time.reduce((acc, cur) => acc + cur.TSHour, 0),
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    //get timeSheet by projectId
    static getTimesheetByProjectId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { projectId } = req.query;
                if (!projectId) {
                    return res.status(400).json({ message: "Bad request" });
                }
                const time = yield sql_utils_1.default.selectUserTimesheetByProjectId(req.app.locals.db, String(projectId));
                return res.status(200).json({
                    message: "Get timesheet success!",
                    total: time.length,
                    result: time,
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    static getUserTimesheets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { monthYear, userId, taskId, projectId } = req.query;
                const timesheet = yield sql_utils_1.default.selectUserTimesheets(req.app.locals.db, String(monthYear), Number(userId), Number(taskId), String(projectId));
                return res
                    .status(200)
                    .json({ message: "Get timesheet success!", data: timesheet });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    static createTimesheet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { TaskId, ProjectId, UserId, TSDate, TSHour } = req.body;
                const user = yield sql_utils_1.default.selectUserById(req.app.locals.db, UserId);
                const project = yield sql_utils_1.default.selectProjectById(req.app.locals.db, ProjectId);
                const { ListMember, ListLeader, ListManager } = project;
                let projectRule = user.JobTitle;
                if (ListLeader === null || ListLeader === void 0 ? void 0 : ListLeader.includes(`(${UserId})`)) {
                    projectRule = "Leader";
                }
                if (ListManager === null || ListManager === void 0 ? void 0 : ListManager.includes(`(${UserId})`)) {
                    projectRule = "Manager";
                }
                if (ListMember === null || ListMember === void 0 ? void 0 : ListMember.includes(`(${UserId})`)) {
                    projectRule = "Member";
                }
                const payload = {
                    TaskId,
                    ProjectId,
                    UserId,
                    UserDiscipline: user.Discipline,
                    ProjectRule: projectRule,
                    TSDate,
                    TSHour,
                    Adjustments: 0,
                    Autoload: Date.now().toLocaleString(),
                };
                const result = yield sql_utils_1.default.insertTimesheet(req.app.locals.db, payload);
                return res
                    .status(200)
                    .json({ message: "Create timesheet success!", data: result });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    static updateTimesheet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { TaskId, ProjectId, UserId, TSDate, TSHour } = req.body;
                const payload = {
                    TaskId,
                    ProjectId,
                    UserId,
                    UserDiscipline: "",
                    ProjectRule: "",
                    TSDate,
                    TSHour,
                    Adjustments: 0,
                    Autoload: Date.now().toLocaleString(),
                };
                const result = yield sql_utils_1.default.updateUserTimesheet(req.app.locals.db, payload);
                return res
                    .status(200)
                    .json({ message: "Create timesheet success!", data: result });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    static removeTimesheet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { TaskId, ProjectId, UserId, TSDate } = req.body;
                const result = yield sql_utils_1.default.deleteTimesheet(req.app.locals.db, {
                    TaskId,
                    ProjectId,
                    UserId,
                    UserDiscipline: "",
                    ProjectRule: "",
                    TSDate,
                    TSHour: 0,
                    Adjustments: 0,
                    Autoload: Date.now().toLocaleString(),
                });
                return res
                    .status(200)
                    .json({ message: "Create timesheet success!", data: result });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
}
exports.default = TimesheetController;
