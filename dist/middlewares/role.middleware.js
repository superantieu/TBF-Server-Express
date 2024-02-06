"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seniorManagerProtector = void 0;
const seniorManagerProtector = (req, res, next) => {
    try {
        const user = req.user;
        const { Discipline, JobTilte } = user;
        if (!String(JobTilte).includes("Senior") && Discipline !== "RnD") {
            return res
                .status(403)
                .json({ message: "You don't have permission" });
        }
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: "Token is not valid!" });
    }
};
exports.seniorManagerProtector = seniorManagerProtector;
