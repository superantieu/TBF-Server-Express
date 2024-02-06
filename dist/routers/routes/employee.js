"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EmployeeController_1 = __importDefault(require("../../controllers/EmployeeController"));
class EmployeeRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this._router.get("/", 
        // verifyAccessToken,
        EmployeeController_1.default.getEmployees);
        //
        this._router.get("/:userId", 
        // verifyAccessToken,
        EmployeeController_1.default.getSpecificEmployees);
    }
    getRouter() {
        return this._router;
    }
}
exports.default = EmployeeRouter;
