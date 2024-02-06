"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AccessRightsController_1 = __importDefault(require("../../controllers/AccessRightsController"));
class AccessRightRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this._router.get("/", 
        // verifyAccessToken,
        AccessRightsController_1.default.getAccessRights);
    }
    getRouter() {
        return this._router;
    }
}
exports.default = AccessRightRouter;
