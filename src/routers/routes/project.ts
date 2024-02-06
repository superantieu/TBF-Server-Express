import { Router } from "express";

import ProjectController from "../../controllers/ProjectController";
import { verifyAccessToken } from "../../utils/auth.utils";

class ProjectRouter {
  private _router: Router;
  constructor() {
    this._router = Router();
    this.initializeRouter();
  }
  private initializeRouter() {
    this._router.get(
      "/:id",
      // verifyAccessToken,
      ProjectController.getUserProjects
    );
    this._router.get(
      "/specific/selectproject",
      // verifyAccessToken,
      ProjectController.getSpecificProjects
    );
    this._router.get(
      "/specific/compact",
      // verifyAccessToken,
      ProjectController.getSpecificCompactProjects
    );
  }
  public getRouter() {
    return this._router;
  }
}
export default ProjectRouter;
