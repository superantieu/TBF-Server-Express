import { Router } from "express";

import TaskController from "../../controllers/TaskController";
import { verifyAccessToken } from "../../utils/auth.utils";

class TaskRouter {
  private _router: Router;
  constructor() {
    this._router = Router();
    this.initializeRouter();
  }
  private initializeRouter() {
    this._router.get(
      "/",
      // verifyAccessToken,
      TaskController.getUserTasks
    );
    this._router.get(
      "/:id",
      // verifyAccessToken,
      TaskController.getUserTasksByUserId
    );
    // Sup

    // get discipline name based on tbTask
    this._router.get(
      "/task/discipline",
      // verifyAccessToken,
      TaskController.getTasksDiscipline
    );

    // get specific task
    this._router.get(
      "/task/specific/:taskId",
      // verifyAccessToken,
      TaskController.getTasksByTaskId
    );
  }
  public getRouter() {
    return this._router;
  }
}
export default TaskRouter;
