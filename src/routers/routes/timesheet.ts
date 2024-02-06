import { Router } from "express";

import TimesheetController from "../../controllers/TimesheetController";
import { verifyAccessToken } from "../../utils/auth.utils";

class TimesheetRouter {
  private _router: Router;
  constructor() {
    this._router = Router();
    this.initializeRouter();
  }
  private initializeRouter() {
    this._router.get(
      "/:id",
      // verifyAccessToken,
      TimesheetController.getUserTimesheet
    );

    this._router.get(
      "/timesheet/project",
      // verifyAccessToken,
      TimesheetController.getTimesheetByProjectId
    );
    this._router.get(
      "/",
      // verifyAccessToken,
      TimesheetController.getUserTimesheets
    );
    this._router.post(
      "/",
      // verifyAccessToken,
      TimesheetController.createTimesheet
    );
    this._router.delete(
      "/",
      // verifyAccessToken,
      TimesheetController.removeTimesheet
    );
    this._router.patch(
      "/",
      // verifyAccessToken,
      TimesheetController.updateTimesheet
    );
  }
  public getRouter() {
    return this._router;
  }
}
export default TimesheetRouter;
