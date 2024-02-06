"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AbsenceController_1 = __importDefault(require("../../controllers/AbsenceController"));
class AbsenceRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this._router.post("/check", 
        // verifyAccessToken,
        AbsenceController_1.default.checkAbsence);
        this._router.post("/submit", 
        //   verifyAccessToken,
        AbsenceController_1.default.createAbsence);
        this._router.get("/request", 
        //   verifyAccessToken,
        AbsenceController_1.default.getLeaveRequest);
        this._router.post("/approve", 
        //   verifyAccessToken,
        AbsenceController_1.default.approveLeaveRequest);
    }
    getRouter() {
        return this._router;
    }
}
exports.default = AbsenceRouter;
