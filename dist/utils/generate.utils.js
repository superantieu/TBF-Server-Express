"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomCode = void 0;
const crypto = require("crypto");
function generateRandomCode() {
    return crypto.randomBytes(20).toString("hex");
}
exports.generateRandomCode = generateRandomCode;
