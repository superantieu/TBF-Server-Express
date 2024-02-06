import { Router } from "express";

import { verifyAccessToken } from "../../utils/auth.utils";
import OvertimeController from "../../controllers/OvertimeController";
import { seniorManagerProtector } from "../../middlewares/role.middleware";

class OvertimeTimeRouter {
  private _router: Router;
  constructor() {
    this._router = Router();
    this.initializeRouter();
  }
  private initializeRouter() {
    this._router.get(
      "/request",
      // verifyAccessToken,
      // seniorManagerProtector,
      OvertimeController.getOTList
    );
    this._router.get(
      "/actual",
      // verifyAccessToken,
      // seniorManagerProtector,
      OvertimeController.getOTActualList
    );
    this._router.post(
      "/request",
      // verifyAccessToken,
      // seniorManagerProtector,
      OvertimeController.postOTApprove
    );
    this._router.post(
      "/actual",
      // verifyAccessToken,
      // seniorManagerProtector,
      OvertimeController.postOTActualApprove
    );
  }
  public getRouter() {
    return this._router;
  }
}

export default OvertimeTimeRouter;
