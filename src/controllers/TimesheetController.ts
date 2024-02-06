import { Request, Response } from "express";

import { IProject } from "../models/ProjectModel";
import { IUser } from "../models/UserModel";

import SqlUtils from "../utils/sql.utils";

export default class TimesheetController {
  static async getUserTimesheet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { date } = req.query;
      const time = await SqlUtils.selectUserTimesheet(
        req.app.locals.db,
        String(date),
        Number(id)
      );
      return res.status(200).json({
        message: "Get timesheet success!",
        data:
          (time as { TSHour: number }[]).length < 1
            ? 0
            : (time as { TSHour: number }[]).reduce(
                (acc, cur) => acc + cur.TSHour,
                0
              ),
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
  //get timeSheet by projectId
  static async getTimesheetByProjectId(req: Request, res: Response) {
    try {
      const { projectId } = req.query;
      if (!projectId) {
        return res.status(400).json({ message: "Bad request" });
      }
      const time = await SqlUtils.selectUserTimesheetByProjectId(
        req.app.locals.db,
        String(projectId)
      );
      return res.status(200).json({
        message: "Get timesheet success!",
        total: time.length,
        result: time,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
  static async getUserTimesheets(req: Request, res: Response) {
    try {
      const { monthYear, userId, taskId, projectId } = req.query;
      const timesheet = await SqlUtils.selectUserTimesheets(
        req.app.locals.db,
        String(monthYear),
        Number(userId),
        Number(taskId),
        String(projectId)
      );
      return res
        .status(200)
        .json({ message: "Get timesheet success!", data: timesheet });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
  static async createTimesheet(req: Request, res: Response) {
    try {
      const { TaskId, ProjectId, UserId, TSDate, TSHour } = req.body;
      const user = await SqlUtils.selectUserById(req.app.locals.db, UserId);
      const project = await SqlUtils.selectProjectById(
        req.app.locals.db,
        ProjectId
      );
      const { ListMember, ListLeader, ListManager } = project as IProject;
      let projectRule = (user as IUser).JobTitle;
      if (ListLeader?.includes(`(${UserId})`)) {
        projectRule = "Leader";
      }
      if (ListManager?.includes(`(${UserId})`)) {
        projectRule = "Manager";
      }
      if (ListMember?.includes(`(${UserId})`)) {
        projectRule = "Member";
      }
      const payload = {
        TaskId,
        ProjectId,
        UserId,
        UserDiscipline: (user as IUser).Discipline,
        ProjectRule: projectRule,
        TSDate,
        TSHour,
        Adjustments: 0,
        Autoload: Date.now().toLocaleString(),
      };
      const result = await SqlUtils.insertTimesheet(req.app.locals.db, payload);
      return res
        .status(200)
        .json({ message: "Create timesheet success!", data: result });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
  static async updateTimesheet(req: Request, res: Response) {
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
      const result = await SqlUtils.updateUserTimesheet(
        req.app.locals.db,
        payload
      );
      return res
        .status(200)
        .json({ message: "Create timesheet success!", data: result });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }

  static async removeTimesheet(req: Request, res: Response) {
    try {
      const { TaskId, ProjectId, UserId, TSDate } = req.body;
      const result = await SqlUtils.deleteTimesheet(req.app.locals.db, {
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
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
}
