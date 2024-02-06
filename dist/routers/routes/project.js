"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProjectController_1 = __importDefault(require("../../controllers/ProjectController"));
class ProjectRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this._router.get("/:id", 
        // verifyAccessToken,
        ProjectController_1.default.getUserProjects);
        this._router.get("/specific/selectproject", 
        // verifyAccessToken,
        ProjectController_1.default.getSpecificProjects);
        this._router.get("/specific/compact", 
        // verifyAccessToken,
        ProjectController_1.default.getSpecificCompactProjects);
    }
    getRouter() {
        return this._router;
    }
}
exports.default = ProjectRouter;
