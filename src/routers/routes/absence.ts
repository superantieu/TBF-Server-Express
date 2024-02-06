import { Router } from "express";

import AbsenceController from "../../controllers/AbsenceController";

import { verifyAccessToken } from "../../utils/auth.utils";

class AbsenceRouter {
  private _router: Router;
  constructor() {
    this._router = Router();
    this.initializeRouter();
  }
  private initializeRouter() {
    this._router.post(
      "/check",
      // verifyAccessToken,
      AbsenceController.checkAbsence
    );
    this._router.post(
      "/submit",
      //   verifyAccessToken,
      AbsenceController.createAbsence
    );
    this._router.get(
      "/request",
      //   verifyAccessToken,
      AbsenceController.getLeaveRequest
    );
    this._router.post(
      "/approve",
      //   verifyAccessToken,
      AbsenceController.approveLeaveRequest
    );
  }
  public getRouter() {
    return this._router;
  }
}
export default AbsenceRouter;
