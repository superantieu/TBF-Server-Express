"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TimesheetController_1 = __importDefault(require("../../controllers/TimesheetController"));
class TimesheetRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this._router.get("/:id", 
        // verifyAccessToken,
        TimesheetController_1.default.getUserTimesheet);
        this._router.get("/timesheet/project", 
        // verifyAccessToken,
        TimesheetController_1.default.getTimesheetByProjectId);
        this._router.get("/", 
        // verifyAccessToken,
        TimesheetController_1.default.getUserTimesheets);
        this._router.post("/", 
        // verifyAccessToken,
        TimesheetController_1.default.createTimesheet);
        this._router.delete("/", 
        // verifyAccessToken,
        TimesheetController_1.default.removeTimesheet);
        this._router.patch("/", 
        // verifyAccessToken,
        TimesheetController_1.default.updateTimesheet);
    }
    getRouter() {
        return this._router;
    }
}
exports.default = TimesheetRouter;
