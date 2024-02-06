import { Request, Response } from "express";
import { DateTime } from "luxon";

import { ILeaveRequest } from "../models/LeaveRequestModel";
import { IProject } from "../models/ProjectModel";
import { IUser } from "../models/UserModel";

import DateTimeUtils from "../utils/datetime.utils";
import HolidayUtils from "../utils/holiday.utils";
import MailUtils from "../utils/mail.utils";
import SqlUtils from "../utils/sql.utils";
import { CLeaveTypeTaskId } from "../constants/task.constant";

export default class AbsenceController {
    static async createAbsence(req: Request, res: Response) {
        try {
            const user = req.user;
            const {
                toManager,
                cc,
                leaveType,
                fromDate,
                toDate,
                fromSession,
                toSession,
                reason,
                handler,
                totalDays,
            } = req.body;
            const toUser: IUser = await SqlUtils.selectUserById(
                req.app.locals.db,
                toManager.value
            );
            const wipProjects = await SqlUtils.selectUserWIPProjects(
                req.app.locals.db,
                user.UserId
            );

            const userSend: IUser = await SqlUtils.selectUserById(
                req.app.locals.db,
                user.UserId
            );
            //Email payload
            const subject = `TBF | ${DateTime.now().toFormat("yyyyMMdd")}_${(
                leaveType.label as string
            ).toUpperCase()} | ${user.UserId}-${(
                user.FullName as string
            ).toUpperCase()} | ${(user.Discipline as string).toUpperCase()} ${(
                user.JobTitle as string
            ).toUpperCase()}`;
            const content = `<div>Dear ${toUser.Sex === "Male" ? "Mr" : "Ms"} ${
                toUser.FullName
            },<br/> Can you please approve my leave request as per details below?<br/><br/><b>${
                leaveType.label
            }:</b>(${totalDays}) day(s)<br/>&emsp;from:&emsp;${fromDate},${
                fromSession.label
            }<br/>&emsp;to:&emsp;&emsp;${toDate},${
                toSession.label
            }<br/><b>Reason:</b>${reason}<br/><b>Handler:</b>${
                handler.label
            }<br/><b>WIP Projects:</b><br/>${
                (wipProjects as { ProjectName: string }[]).length > 0
                    ? (
                          (wipProjects as IProject[]).map(
                              (p) => `${p.ProjectName}<br/>`
                          ) + ""
                      )
                          .split(",")
                          .join("")
                    : "I have completed all the assigned projects."
            }<br/>Looking forward for your approval. Thank you.<br/><br/>
      Sincerely,<br/><b>${user.FullName}</b></div>`;
            //Send mail
            const handlerUser: IUser = await SqlUtils.selectUserById(
                req.app.locals.db,
                handler.value
            );
            const hrUser: IUser = await SqlUtils.selectUserByEmail(
                req.app.locals.db,
                "hr@the-bim-factory.com"
            );
            const ccIds = (cc as { value: string; label: string }[])
                .map((e) => Number(e.value))
                .filter(
                    (e) =>
                        e !== 0 &&
                        e !== toUser.UserId &&
                        e !== handlerUser.UserId
                );
            const ccUsers = await SqlUtils.selectUsersByIds(
                req.app.locals.db,
                ccIds
            );

            const ccEmails = (ccUsers as IUser[]).map((user) => user.Email);

            let allCCEmails: string[] = [
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
            const payload: ILeaveRequest = {
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
                ProjectNotComplete:
                    (wipProjects as { ProjectName: string }[]).length > 0
                        ? (
                              (wipProjects as { ProjectName: string }[]).map(
                                  (p) => p.ProjectName
                              ) + ""
                          )
                              .split(",")
                              .join(" : ")
                        : "I have completed all the assigned projects.",
                Approved: 0,
                Subject: subject,
                MailId: "",
            };
            await SqlUtils.insertLeaveRequest(req.app.locals.db, payload);

            const idsToNotification = [
                ...ccIds,
                handlerUser.UserId,
                hrUser.UserId,
                toUser.UserId,
            ];
            for (let i = 0; i < idsToNotification.length; i++) {
                const id = idsToNotification[i];

                const msg = `${user.FullName} want to leave from ${fromDate} ${fromSession.label} to ${toDate} ${toSession.label} because ${reason}. Handler: ${handler.label}`;
                await SqlUtils.insertNotifications(req.app.locals.db, {
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

            const mailUtils = new MailUtils();
            await mailUtils.sendEmail(
                // ["chuong.do@the-bim-factory.com"],
                // ["chuong.do@the-bim-factory.com"],
                [toUser.Email],
                ccList,
                subject,
                content
            );
            return res.status(200).json({ message: "Leave resquest sent" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    static async getLeaveRequest(req: Request, res: Response) {
        try {
            const user = req.user;
            const findUser = await SqlUtils.selectUserById(
                req.app.locals.db,
                user.UserId
            );
            if (!findUser) {
                return res.status(404).json({ message: "User not found!" });
            }
            const requestList = await SqlUtils.selectUserLeaveRequest(
                req.app.locals.db,
                findUser.Email
                // "jk.pascasio@the-bim-factory.com"
            );
            const ids = requestList.map((x) => x.UserId);
            const users = await SqlUtils.selectUsersByIds(
                req.app.locals.db,
                ids
            );
            const userInfos = users.map((x) => ({
                UserId: x.UserId,
                FullName: x.FullName,
                JobTitle: x.JobTitle,
                Discipline: x.Discipline,
            }));
            const result = requestList.map((x) => ({
                ...x,
                User: userInfos.find((e) => e.UserId === x.UserId),
            }));

            return res.status(200).json({
                message: "Get leave request success!",
                data: result,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    static async approveLeaveRequest(req: Request, res: Response) {
        try {
            const { id, isApproved } = req.body;

            if (typeof isApproved !== "boolean" || !id) {
                return res.status(406).json({ message: "Missing data" });
            }

            const findRequest = await SqlUtils.selectLeaveRequestById(
                req.app.locals.db,
                id
            );
            if (!findRequest) {
                return res
                    .status(404)
                    .json({ message: "Not found leave request" });
            }
            const {
                LeaveType,
                CountDays,
                LeaveFrom,
                LeaveTo,
                LeaveTimeFrom,
                LeaveTimeTo,
                ...rest
            } = findRequest;

            const numberDay = Number(
                (CountDays as string).split(" ")[0].replace("(", "")
            ); // OK

            const findUser = await SqlUtils.selectUserById(
                req.app.locals.db,
                rest.UserId
            );

            if (!findUser) {
                res.status(404).json({
                    message: "Not found user to update timesheet",
                });
            }
            let projectRule = "Member";
            if (findUser.JobTitle?.includes(`Leader`)) {
                projectRule = "Leader";
            } else if (findUser.JobTitle?.includes(`Manager`)) {
                projectRule = "Manager";
            } else {
                projectRule = "Member";
            }

            if (numberDay < 1) {
                await SqlUtils.insertTimesheet(req.app.locals.db, {
                    TaskId: CLeaveTypeTaskId[LeaveType],
                    ProjectId: "TBF-000-LEAVE",
                    UserId: findUser.UserId,
                    UserDiscipline: findUser.Discipline,
                    ProjectRule: projectRule,
                    TSDate: new Date(LeaveFrom).toISOString(),
                    TSHour: 4,
                    Adjustments: 0,
                    Autoload: Date.now().toLocaleString(),
                });
            } else if (numberDay > 0) {
                if (Number.isInteger(numberDay)) {
                    for (let i = 0; i < numberDay; i++) {
                        const tsDate =
                            new Date(LeaveFrom).getTime() +
                            i * (24 * 3600 * 1000);

                        await SqlUtils.insertTimesheet(req.app.locals.db, {
                            TaskId: CLeaveTypeTaskId[LeaveType],
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
                } else {
                    if (LeaveTimeFrom === "Afternoon") {
                        await SqlUtils.insertTimesheet(req.app.locals.db, {
                            TaskId: CLeaveTypeTaskId[LeaveType],
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
                            const tsDate =
                                new Date(LeaveFrom).getTime() +
                                i * (24 * 3600 * 1000);

                            await SqlUtils.insertTimesheet(req.app.locals.db, {
                                TaskId: CLeaveTypeTaskId[LeaveType],
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
                    } else {
                        for (let i = 0; i < numberDay - 1; i++) {
                            const tsDate =
                                new Date(LeaveFrom).getTime() +
                                i * (24 * 3600 * 1000);

                            await SqlUtils.insertTimesheet(req.app.locals.db, {
                                TaskId: CLeaveTypeTaskId[LeaveType],
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
                        await SqlUtils.insertTimesheet(req.app.locals.db, {
                            TaskId: CLeaveTypeTaskId[LeaveType],
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
            } else {
                return res.status(403).json({
                    message: "Approve not success!",
                    data: "",
                });
            }
            await SqlUtils.updateLeaveRequest(
                req.app.locals.db,
                id,
                isApproved ? 1 : 2
            );
            return res.status(200).json({
                message: "Approve success!",
                data: "",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    static async checkAbsence(req: Request, res: Response) {
        try {
            const { fromDate, toDate, fromSession, toSession } = req.body;
            const holidays = await SqlUtils.selectAllHolidays(
                req.app.locals.db
            );

            const holidayUtils = new HolidayUtils(holidays);
            const fromDateLocal = DateTime.fromISO(
                fromDate as string
            ).toLocaleString();
            const toDateLocal = DateTime.fromISO(
                toDate as string
            ).toLocaleString();

            try {
                const dateRange = DateTimeUtils.getDatesInRange(
                    fromDateLocal,
                    toDateLocal
                );

                const filterNotWorkingDay = dateRange.filter((date) => {
                    let isWorkingDay = DateTimeUtils.isWorkingDay(
                        date.toLocaleString(),
                        process.env.WORKINGDAY_SATURDAY
                    );
                    return isWorkingDay;
                });
                const filterDateByHolidays = filterNotWorkingDay.filter(
                    (date) => {
                        let isHoliday = holidayUtils.isHoliday(
                            DateTime.fromJSDate(date).toFormat("yyyyMMdd")
                        );
                        return !isHoliday;
                    }
                );

                let totalDay = filterDateByHolidays.length;

                if (
                    totalDay === 1 &&
                    fromSession.label === "Afternoon" &&
                    toSession.label === "Morning"
                ) {
                    return res.status(406).json({
                        message:
                            "Input time session error (Morning -> Afternoon), please check it",
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
            } catch (error) {
                return res.status(500).json({
                    message: "The days input is not correct, please check it",
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    }
}
