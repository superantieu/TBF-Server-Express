import { Router } from "express";
import EmployeeController from "../../controllers/EmployeeController";
import { verifyAccessToken } from "../../utils/auth.utils";

class EmployeeRouter {
  private _router: Router;
  constructor() {
    this._router = Router();
    this.initializeRouter();
  }
  private initializeRouter() {
    this._router.get(
      "/",
      // verifyAccessToken,
      EmployeeController.getEmployees
    );
    //
    this._router.get(
      "/:userId",
      // verifyAccessToken,
      EmployeeController.getSpecificEmployees
    );
  }

  public getRouter() {
    return this._router;
  }
}
export default EmployeeRouter;
