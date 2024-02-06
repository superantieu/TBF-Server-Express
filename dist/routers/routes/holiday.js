"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HolidayController_1 = __importDefault(require("../../controllers/HolidayController"));
const auth_utils_1 = require("../../utils/auth.utils");
class HolidayRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this._router.get("/", auth_utils_1.verifyAccessToken, HolidayController_1.default.getHolidays);
    }
    getRouter() {
        return this._router;
    }
}
exports.default = HolidayRouter;
