"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OffsetTimeController_1 = __importDefault(require("../../controllers/OffsetTimeController"));
class OffsetTimeRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this._router.post("/", 
        // verifyAccessToken,
        OffsetTimeController_1.default.sendOffsetTime);
    }
    getRouter() {
        return this._router;
    }
}
exports.default = OffsetTimeRouter;
