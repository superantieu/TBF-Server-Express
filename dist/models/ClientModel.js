"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const clientSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    workFolder: { type: String, required: false },
}, { timestamps: true });
exports.ClientModel = mongoose_1.default.model("Client", clientSchema);
