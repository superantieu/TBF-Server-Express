import { Request, Response } from "express";

import { IUser } from "../models/UserModel";

import MailUtils from "../utils/mail.utils";
import SqlUtils from "../utils/sql.utils";

//DEFINE
export default class OffsetTimeController {
    static async sendOffsetTime(req: Request, res: Response) {
        try {
            const user = req.user;
            const {
                toManager,
                cc,
                fromDateTime,
                toDateTime,
                reason,
                makeUpTime,
                handler,
                totalHours,
            } = req.body;
            const toUser: IUser = await SqlUtils.selectUserById(
                req.app.locals.db,
                toManager.value
            );
            const userSend: IUser = await SqlUtils.selectUserById(
                req.app.locals.db,
                user.UserId
            );
            const handlerUser = await SqlUtils.selectUserById(
                req.app.locals.db,
                handler.value
            );
            //Email payload
            const subject = `OFFSET TIME | ${user.UserId}-${(
                user.FullName as string
            ).toUpperCase()} | ${(user.Discipline as string).toUpperCase()} ${(
                user.JobTitle as string
            ).toUpperCase()}`;
            const content = `<div>Dear ${toUser.Sex === "Male" ? "Mr" : "Ms"} ${
                toUser.FullName
            },<br/> Could you approve my offset time request as per details below, please?<br/><br/><b>Check-Out:</b>(${totalHours}) hour(s)<br/>&emsp;from:&emsp;${(
                fromDateTime as string
            ).replace("T", " ")}<br/>&emsp;to:&emsp;&emsp;${(
                toDateTime as string
            ).replace(
                "T",
                " "
            )}<br/><b>Reason:</b>${reason}<br/><b>Make-Up Time:</b>${makeUpTime}<br/><b>Handler:</b>${
                handler.label
            }<br/>Looking forward for your approval. Thank you.<br/><br/>
      Best regards,<br/><b>${user.FullName}</b></div>`;

            //Send mail
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
            const mailUtils = new MailUtils();
            await mailUtils.sendEmail(
                // ["chuong.do@the-bim-factory.com"],
                // ["chuong.do@the-bim-factory.com"],
                [toUser.Email],
                [
                    "admin@the-bim-factory.com",
                    "hr@the-bim-factory.com",
                    ...allCCEmails.map((e) => `${e}`),
                ],
                subject,
                content
            );
            return res
                .status(200)
                .json({ message: "Offset time resquest sent" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}
