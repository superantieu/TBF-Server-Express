import { Request, Response } from "express";

import SqlUtils from "../utils/sql.utils";

export default class HolidayController {
    static async getHolidays(req: Request, res: Response) {
        try {
            const user = req.user;
            const findUser = await SqlUtils.selectUserById(
                req.app.locals.db,
                user.UserId
            );
            if (!findUser) {
                return res.status(404).json({ message: "User not found!" });
            }

            return res.status(200).json({
                message: "Get leave request success!",
                data: "result",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}
