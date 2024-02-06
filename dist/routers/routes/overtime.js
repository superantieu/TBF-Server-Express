"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OvertimeController_1 = __importDefault(require("../../controllers/OvertimeController"));
class OvertimeTimeRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this._router.get("/request", 
        // verifyAccessToken,
        // seniorManagerProtector,
        OvertimeController_1.default.getOTList);
        this._router.get("/actual", 
        // verifyAccessToken,
        // seniorManagerProtector,
        OvertimeController_1.default.getOTActualList);
        this._router.post("/request", 
        // verifyAccessToken,
        // seniorManagerProtector,
        OvertimeController_1.default.postOTApprove);
        this._router.post("/actual", 
        // verifyAccessToken,
        // seniorManagerProtector,
        OvertimeController_1.default.postOTActualApprove);
    }
    getRouter() {
        return this._router;
    }
}
exports.default = OvertimeTimeRouter;
