import { NextFunction, Request, Response } from "express";

export const seniorManagerProtector = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        const { Discipline, JobTilte } = user;
        if (!String(JobTilte).includes("Senior") && Discipline !== "RnD") {
            return res
                .status(403)
                .json({ message: "You don't have permission" });
        }
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Token is not valid!" });
    }
};
