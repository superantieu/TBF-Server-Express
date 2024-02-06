"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const sha1_1 = __importDefault(require("sha1"));
const path_1 = __importDefault(require("path"));
const auth_utils_1 = require("../utils/auth.utils");
const sql_utils_1 = __importDefault(require("../utils/sql.utils"));
const generate_utils_1 = require("../utils/generate.utils");
const mail_utils_1 = __importDefault(require("../utils/mail.utils"));
//DEFINE
class UserController {
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, password } = req.body;
                const user = yield sql_utils_1.default.selectUserById(req.app.locals.db, userId);
                console.log("user", user);
                if (!user) {
                    return res.status(404).json({
                        message: `User not found!`,
                    });
                }
                if ((0, sha1_1.default)(password) !== user.Password) {
                    return res.status(403).json({
                        message: `Password incorrect!`,
                    });
                }
                if (!user.Employed) {
                    return res.status(403).json({
                        message: `User is not an employee!`,
                    });
                }
                const { UserId, FullName, Discipline, JobTitle, Email } = user, rest = __rest(user, ["UserId", "FullName", "Discipline", "JobTitle", "Email"]);
                const newtokens = (0, auth_utils_1.generateTokens)({
                    UserId,
                    FullName,
                    Discipline,
                    JobTitle,
                });
                //Send response
                res.cookie("rt", newtokens.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    path: "/",
                    sameSite: "strict",
                });
                return res.status(200).json({
                    message: `Login success!`,
                    data: newtokens.accessToken,
                });
            }
            catch (err) {
                return res.status(500).json({ error: err });
            }
        });
    }
    //Logout
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("rt");
                return res.status(200).json({ message: "Logout success" });
            }
            catch (error) {
                return res.status(500).json({ error: error });
            }
        });
    }
    //Create user
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const _a = req.body, { userId, email, fullName, discipline, jobTitle, sex, employed, startWorkingDate } = _a, rest = __rest(_a, ["userId", "email", "fullName", "discipline", "jobTitle", "sex", "employed", "startWorkingDate"]);
            try {
                return res.status(201).json({ message: "Add member successful!" });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Something is broken!" });
            }
        });
    }
    static forgot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            try {
                const user = yield sql_utils_1.default.selectUserById(req.app.locals.db, id);
                if (!user) {
                    return res.status(404).json({
                        message: `User not found!`,
                    });
                }
                if (!user.Employed) {
                    return res.status(403).json({
                        message: `User is not an employee!`,
                    });
                }
                const { UserId, Email } = user;
                const settings = yield sql_utils_1.default.selectUserSettings(req.app.locals.db, UserId);
                if (!settings) {
                    return res.status(404).json({
                        message: `User settings not found!`,
                    });
                }
                // const { Token } = settings;
                // if (Token) {
                //     return res.status(200).json({
                //         message: `Token have been sent to your email. Please check!`,
                //     });
                // }
                if (!Email) {
                    return res.status(404).json({
                        message: `Email not found!`,
                    });
                }
                const token = (0, generate_utils_1.generateRandomCode)();
                //Save code to database
                yield sql_utils_1.default.updateSettings(req.app.locals.db, UserId, token);
                //Format email
                const emailTemplatePath = path_1.default.join(__dirname, "../templates/email/reset-password-template.html");
                const emailTemplate = fs_1.default.readFileSync(emailTemplatePath, "utf-8");
                const emailContent = emailTemplate.replace("{{ token }}", token);
                const mailer = new mail_utils_1.default();
                yield mailer.sendEmail([Email], [], `TBF Polaris | Reset Password | ${UserId}`, emailContent);
                //
                return res.status(200).json({
                    message: "An email have just sent to your email. Please check!",
                    data: Email,
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Something is broken!" });
            }
        });
    }
    static submit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, token, newPassword, confirmPassword } = req.body;
            try {
                const user = yield sql_utils_1.default.selectUserById(req.app.locals.db, userId);
                if (!user) {
                    return res.status(404).json({
                        message: `User not found!`,
                    });
                }
                if (!user.Employed) {
                    return res.status(403).json({
                        message: `User is not an employee!`,
                    });
                }
                const { UserId } = user;
                const settings = yield sql_utils_1.default.selectUserSettings(req.app.locals.db, UserId);
                if (!settings) {
                    return res.status(404).json({
                        message: `User settings not found!`,
                    });
                }
                const { Token } = settings;
                if (!Token) {
                    return res.status(404).json({
                        message: `Token is not found!`,
                    });
                }
                if (Token !== token) {
                    return res.status(403).json({
                        message: `Token is not correct!`,
                    });
                }
                //Change password
                if (!newPassword || newPassword !== confirmPassword) {
                    return res.status(406).json({
                        message: `Missing password or password confirm failed!`,
                    });
                }
                const pass = (0, sha1_1.default)(newPassword);
                yield sql_utils_1.default.updateUserPassword(req.app.locals.db, UserId, pass);
                //Clear token
                yield sql_utils_1.default.updateSettings(req.app.locals.db, UserId, "");
                return res.status(200).json({
                    message: "Reset password success!",
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Something is broken!" });
            }
        });
    }
    static refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                // const rt = req.cookies.rt;
                const find = sql_utils_1.default.selectUserById(req.app.locals.db, user.UserId);
                if (!find) {
                    return res.status(404).json({
                        message: "Not found",
                    });
                }
                //Store token and ip for check later
                const newTokens = (0, auth_utils_1.generateTokens)({
                    UserId: user.UserId,
                    FullName: user.FullName,
                    Discipline: user.Discipline,
                    JobTitle: user.JobTitle,
                    Email: user.Email,
                });
                //Response
                res.cookie("rt", newTokens.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    path: "/",
                    sameSite: "strict",
                    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                });
                return res.status(200).json({
                    message: "Refresh tokens success",
                    data: newTokens.accessToken,
                });
            }
            catch (error) {
                return res.status(500).json({ message: "Internal server error", error });
            }
        });
    }
    static check(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return res.status(200).json({ message: "I'm fine!" });
        });
    }
    static getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield sql_utils_1.default.selectAllUsers(req.app.locals.db);
                return res
                    .status(200)
                    .json({ message: "Get users success!", data: users });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
}
exports.default = UserController;
