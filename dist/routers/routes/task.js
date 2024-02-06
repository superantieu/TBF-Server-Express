"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TaskController_1 = __importDefault(require("../../controllers/TaskController"));
class TaskRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this._router.get("/", 
        // verifyAccessToken,
        TaskController_1.default.getUserTasks);
        this._router.get("/:id", 
        // verifyAccessToken,
        TaskController_1.default.getUserTasksByUserId);
        // Sup
        // get discipline name based on tbTask
        this._router.get("/task/discipline", 
        // verifyAccessToken,
        TaskController_1.default.getTasksDiscipline);
        // get specific task
        this._router.get("/task/specific/:taskId", 
        // verifyAccessToken,
        TaskController_1.default.getTasksByTaskId);
    }
    getRouter() {
        return this._router;
    }
}
exports.default = TaskRouter;
