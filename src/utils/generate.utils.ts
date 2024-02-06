const crypto = require("crypto");
export function generateRandomCode() {
    return crypto.randomBytes(20).toString("hex");
}
