import { Router } from "express";

import HolidayController from "../../controllers/HolidayController";
import { verifyAccessToken } from "../../utils/auth.utils";

class HolidayRouter {
    private _router: Router;
    constructor() {
        this._router = Router();
        this.initializeRouter();
    }
    private initializeRouter() {
        this._router.get("/", verifyAccessToken, HolidayController.getHolidays);
    }
    public getRouter() {
        return this._router;
    }
}
export default HolidayRouter;
