import { Router } from "express";
import UserController from "../../controllers/UserController";
import { verifyAccessToken, verifyRefreshToken } from "../../utils/auth.utils";

class AuthRouter {
    private _router: Router;
    constructor() {
        this._router = Router();
        this.initializeRouter();
    }
    private initializeRouter() {
        this._router.get("/check", verifyAccessToken, UserController.check);
        this._router.post("/login", UserController.login);
        this._router.post("/logout", verifyAccessToken, UserController.logout);
        this._router.get(
            "/rf",
            verifyRefreshToken,
            UserController.refreshToken
        );
        this._router.post("/register", UserController.register);
        this._router.post("/forgot", UserController.forgot);
        this._router.post("/submit", UserController.submit);
    }
    public getRouter() {
        return this._router;
    }
}
export default AuthRouter;
