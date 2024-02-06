import { Router } from "express";

import AccessRightController from "../../controllers/AccessRightsController";

import { verifyAccessToken } from "../../utils/auth.utils";

class AccessRightRouter {
  private _router: Router;
  constructor() {
    this._router = Router();
    this.initializeRouter();
  }
  private initializeRouter() {
    this._router.get(
      "/",
      // verifyAccessToken,
      AccessRightController.getAccessRights
    );
  }
  public getRouter() {
    return this._router;
  }
}
export default AccessRightRouter;
