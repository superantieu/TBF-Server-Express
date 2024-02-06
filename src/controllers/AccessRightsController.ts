import { Request, Response } from "express";

import SqlUtils from "../utils/sql.utils";

export default class AccessRightController {
  static async getAccessRights(req: Request, res: Response) {
    try {
      const { appName } = req.query;
      const accessRights = await SqlUtils.selectAccessRights(
        req.app.locals.db,
        String(appName)
      );
      return res.status(200).json({
        message: "Get timesheet success!",
        data: accessRights,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
}
