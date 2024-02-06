"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = __importDefault(require("../../controllers/UserController"));
const auth_utils_1 = require("../../utils/auth.utils");
class AuthRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this._router.get("/check", auth_utils_1.verifyAccessToken, UserController_1.default.check);
        this._router.post("/login", UserController_1.default.login);
        this._router.post("/logout", auth_utils_1.verifyAccessToken, UserController_1.default.logout);
        this._router.get("/rf", auth_utils_1.verifyRefreshToken, UserController_1.default.refreshToken);
        this._router.post("/register", UserController_1.default.register);
        this._router.post("/forgot", UserController_1.default.forgot);
        this._router.post("/submit", UserController_1.default.submit);
    }
    getRouter() {
        return this._router;
    }
}
exports.default = AuthRouter;
