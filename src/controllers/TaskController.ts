import { Request, Response } from "express";

import SqlUtils from "../utils/sql.utils";

//DEFINE
export default class TaskController {
  static async getUserTasks(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(403).json({ message: "Forbidden!" });
      }
      const tasks = await SqlUtils.selectUserTasks(
        req.app.locals.db,
        Number(user.UserId)
      );
      return res
        .status(200)
        .json({ message: "Get tasks successfully!", data: tasks });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
  static async getUserTasksByUserId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(404).json({ message: "Not Found" });
      }
      const tasks = await SqlUtils.selectUserTasks(
        req.app.locals.db,
        Number(id)
      );
      return res
        .status(200)
        .json({ message: "Get tasks successfully!", data: tasks });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
  // Sup

  // get specific task
  static async getTasksByTaskId(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      if (!taskId) {
        return res.status(404).json({ message: "Not Found" });
      }
      const tasks = await SqlUtils.selectTask(
        req.app.locals.db,
        Number(taskId)
      );
      return res
        .status(200)
        .json({ message: "Get tasks successfully!", result: tasks });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }

  // get discipline name based on tbTask
  static async getTasksDiscipline(req: Request, res: Response) {
    try {
      const { searchTerm } = req.query;
      const tasks = await SqlUtils.selectTaskDiscipline(
        req.app.locals.db,
        searchTerm ? String(searchTerm) : ""
      );
      return res
        .status(200)
        .json({ message: "Get tasks successfully!", result: tasks });
    } catch (error) {
      console.log("erroe", error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
}
