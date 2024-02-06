import { Router } from "express";

import OffsetTimeController from "../../controllers/OffsetTimeController";

import { verifyAccessToken } from "../../utils/auth.utils";

class OffsetTimeRouter {
  private _router: Router;
  constructor() {
    this._router = Router();
    this.initializeRouter();
  }
  private initializeRouter() {
    this._router.post(
      "/",
      // verifyAccessToken,
      OffsetTimeController.sendOffsetTime
    );
  }
  public getRouter() {
    return this._router;
  }
}
export default OffsetTimeRouter;
