import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { DateTime } from "luxon";
import handlebars from "handlebars";

import MailUtils from "../utils/mail.utils";
import SqlUtils from "../utils/sql.utils";

export default class OvertimeController {
    static async getOTList(req: Request, res: Response) {
        try {
            const user = req.user;
            const findUser = await SqlUtils.selectUserById(
                req.app.locals.db,
                user.UserId
            );
            if (!user) {
                return res.status(404).json({ message: "User not found!" });
            }

            const otList = await SqlUtils.selectAllOTRequest(
                req.app.locals.db,
                // 88
                findUser.UserId
            );
            const otResult = await Promise.all(
                otList.map(async (x) => {
                    const {
                        ProjectId,
                        SentByUserId,
                        OTUserIds,
                        Approved,
                        CCUserIds,
                        EmailTitle,
                        ToUserIds,
                        ...rest
                    } = x;

                    const { ProjectName, ...projectRest } =
                        await SqlUtils.selectProjectById(
                            req.app.locals.db,
                            ProjectId
                        );

                    const { UserId, FullName } = await SqlUtils.selectUserById(
                        req.app.locals.db,
                        SentByUserId
                    );
                    const ids = String(OTUserIds)
                        .split(",")
                        .map((x) => Number(x.slice(1, x.length - 1)));

                    const otUsers = await SqlUtils.selectUsersByIds(
                        req.app.locals.db,
                        ids
                    );
                    const otUsersInfo = otUsers.map((x) => ({
                        UserId: x.UserId,
                        FullName: x.FullName,
                        Discipline: x.Discipline,
                        JobTitle: x.JobTitle,
                    }));
                    return {
                        ...rest,
                        Project: {
                            ProjectId: projectRest.ProjectId,
                            ProjectName,
                        },
                        SentFromUser: { UserId, FullName },
                        OTUsers: otUsersInfo,
                    };
                })
            );
            return res
                .status(200)
                .json({ message: "Get ot list success!", data: otResult });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    static async getOTActualList(req: Request, res: Response) {
        try {
            const user = req.user;
            const findUser = await SqlUtils.selectUserById(
                req.app.locals.db,
                user.UserId
            );
            if (!user) {
                return res.status(404).json({ message: "User not found!" });
            }

            const otList = await SqlUtils.selectAllOTActual(
                req.app.locals.db,
                // 88
                findUser.UserId
            );
            const otResult = await Promise.all(
                otList.map(async (x) => {
                    const {
                        SentByUserId,
                        Img,
                        EmailBody,
                        EmailTitle,
                        ...rest
                    } = x;

                    const { UserId, FullName } = await SqlUtils.selectUserById(
                        req.app.locals.db,
                        SentByUserId
                    );
                    return {
                        ...rest,
                        SentFromUser: { UserId, FullName },
                    };
                })
            );
            return res.status(200).json({
                message: "Get ot actual list success!",
                data: otResult,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    }

    static async postOTApprove(req: Request, res: Response) {
        try {
            const { UserId, FullName } = req.user;
            const { id, isApproved } = req.body;

            if (typeof isApproved !== "boolean" || !id) {
                return res.status(406).json({ message: "Missing data" });
            }

            const mailer = new MailUtils();
            //Format email
            const emailTemplatePath = path.join(
                __dirname,
                "../templates/email/overtime-approval-template.hbs"
            );
            const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
            const template = handlebars.compile(emailTemplate);

            const findOtRequest = await SqlUtils.selectOTRequestById(
                req.app.locals.db,
                id
            );

            if (!findOtRequest) {
                return res.status(404).json({ message: "Not found request!" });
            }
            const {
                ProjectId,
                SentByUserId,
                OTUserIds,
                Approved,
                CCUserIds,
                EmailTitle,
                ToUserIds,
                OTFromDate,
                OTToDate,
                ...rest
            } = findOtRequest;

            const sentBy = await SqlUtils.selectUserById(
                req.app.locals.db,
                SentByUserId
            );
            const toIds = String(ToUserIds)
                .split(",")
                .map((x) => Number(x.slice(1, x.length - 1)));

            const toUsers = await SqlUtils.selectUsersByIds(
                req.app.locals.db,
                toIds
            );
            const toUserNames = toUsers.map((x) => x.FullName);
            const toUserEmails = toUsers.map((x) => x.Email);

            const project = await SqlUtils.selectProjectById(
                req.app.locals.db,
                ProjectId
            );

            const ids = String(OTUserIds)
                .split(",")
                .map((x) => Number(x.slice(1, x.length - 1)));
            const personnel = await SqlUtils.selectUsersByIds(
                req.app.locals.db,
                ids
            );
            const otUsers = personnel.map((x) => x.FullName);

            const params = {
                to: sentBy.FullName, //Tên người gửi request
                from: FullName, //Senior manager name
                froms: toUserNames.join(`, `),
                projectName: project.ProjectName,
                hours: findOtRequest.Hours,
                fromDate: DateTime.fromJSDate(
                    new Date(findOtRequest.OTFromDate)
                ).toFormat("DD"),
                toDate: DateTime.fromJSDate(
                    new Date(findOtRequest.OTToDate)
                ).toFormat("DD"),
                totalDate:
                    (new Date(findOtRequest.OTToDate).getTime() -
                        new Date(findOtRequest.OTFromDate).getTime()) /
                        (24 * 3600 * 1000) +
                    1,
                schedule: findOtRequest.Session,
                notes: findOtRequest.Notes ? findOtRequest.Notes : "...",
                personnel: otUsers,
                approvalStatus: isApproved ? "APPROVED" : "REFUSED",
                approvalStatusLowercase: isApproved ? "approved" : "refused",
            };
            const emailContent = template(params);
            await mailer.replyEmail({
                from: "polaris@the-bim-factory.com",
                to: [sentBy.Email],
                cc: [
                    ...toUserEmails,
                    "hr@the-bim-factory.com",
                    "admin@the-bim-factory.com",
                ],
                subject: EmailTitle,
                html: emailContent,
            });
            await SqlUtils.updateOTRequest(
                req.app.locals.db,
                id,
                isApproved ? 1 : 2,
                UserId
                // 88
            );

            return res
                .status(200)
                .json({ message: "Update OT request success!" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    }
    static async postOTActualApprove(req: Request, res: Response) {
        try {
            const { UserId, FullName } = req.user;
            const { id, isApproved } = req.body;

            if (typeof isApproved !== "boolean" || !id) {
                return res.status(406).json({ message: "Missing data" });
            }

            const mailer = new MailUtils();

            const findOtRequest = await SqlUtils.selectOTActualById(
                req.app.locals.db,
                id
            );

            if (!findOtRequest) {
                return res.status(404).json({ message: "Not found request!" });
            }
            const { EmailTitle, EmailBody, SentByUserId, ToUserIds } =
                findOtRequest;
            const sentBy = await SqlUtils.selectUserById(
                req.app.locals.db,
                SentByUserId
            );
            const toIds = String(ToUserIds)
                .split(",")
                .map((x) => Number(x.slice(1, x.length - 1)));

            const toUsers = await SqlUtils.selectUsersByIds(
                req.app.locals.db,
                toIds
            );
            const toUserEmails = toUsers.map((x) => x.Email);
            const emailContent = `<body>
            <p>${sentBy.FullName} wrote:</p>
            <br />
            <div>
                ${EmailBody}
            </div>
            <p>-------------</p>
            <br />
            <p>Dear Mr/Ms ${sentBy.FullName},</p>
            <p><strong>This is ${
                isApproved ? "APPROVED" : "REFUSED"
            }.</strong></p>
            <br />
            <p>
                Dear HR & Admin, please note this has been
                ${isApproved ? "approved" : "refused"}.
            </p>
            <br />
            <p>Sincerely,</p>
            <p>${FullName}</p>
            </body>`;

            if (!sentBy.Email) {
                return res
                    .status(404)
                    .json({ message: "NotFound user email!" });
            }
            await mailer.replyEmail({
                from: "polaris@the-bim-factory.com",
                to: [sentBy.Email],
                cc: [
                    ...toUserEmails,
                    "hr@the-bim-factory.com",
                    "admin@the-bim-factory.com",
                ],
                subject: EmailTitle,
                html: emailContent,
                attachments: {
                    filename: "image.jpg",
                    content: findOtRequest.Img,
                    contentType: "contentType",
                },
            });

            await SqlUtils.updateOTActual(
                req.app.locals.db,
                id,
                isApproved ? 1 : 2,
                UserId
                // 88
            );

            return res
                .status(200)
                .json({ message: "Update OT actual success!" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    }
}
