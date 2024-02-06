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
const path_1 = __importDefault(require("path"));
const luxon_1 = require("luxon");
const handlebars_1 = __importDefault(require("handlebars"));
const mail_utils_1 = __importDefault(require("../utils/mail.utils"));
const sql_utils_1 = __importDefault(require("../utils/sql.utils"));
class OvertimeController {
    static getOTList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const findUser = yield sql_utils_1.default.selectUserById(req.app.locals.db, user.UserId);
                if (!user) {
                    return res.status(404).json({ message: "User not found!" });
                }
                const otList = yield sql_utils_1.default.selectAllOTRequest(req.app.locals.db, 
                // 88
                findUser.UserId);
                const otResult = yield Promise.all(otList.map((x) => __awaiter(this, void 0, void 0, function* () {
                    const { ProjectId, SentByUserId, OTUserIds, Approved, CCUserIds, EmailTitle, ToUserIds } = x, rest = __rest(x, ["ProjectId", "SentByUserId", "OTUserIds", "Approved", "CCUserIds", "EmailTitle", "ToUserIds"]);
                    const _a = yield sql_utils_1.default.selectProjectById(req.app.locals.db, ProjectId), { ProjectName } = _a, projectRest = __rest(_a, ["ProjectName"]);
                    const { UserId, FullName } = yield sql_utils_1.default.selectUserById(req.app.locals.db, SentByUserId);
                    const ids = String(OTUserIds)
                        .split(",")
                        .map((x) => Number(x.slice(1, x.length - 1)));
                    const otUsers = yield sql_utils_1.default.selectUsersByIds(req.app.locals.db, ids);
                    const otUsersInfo = otUsers.map((x) => ({
                        UserId: x.UserId,
                        FullName: x.FullName,
                        Discipline: x.Discipline,
                        JobTitle: x.JobTitle,
                    }));
                    return Object.assign(Object.assign({}, rest), { Project: {
                            ProjectId: projectRest.ProjectId,
                            ProjectName,
                        }, SentFromUser: { UserId, FullName }, OTUsers: otUsersInfo });
                })));
                return res
                    .status(200)
                    .json({ message: "Get ot list success!", data: otResult });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static getOTActualList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const findUser = yield sql_utils_1.default.selectUserById(req.app.locals.db, user.UserId);
                if (!user) {
                    return res.status(404).json({ message: "User not found!" });
                }
                const otList = yield sql_utils_1.default.selectAllOTActual(req.app.locals.db, 
                // 88
                findUser.UserId);
                const otResult = yield Promise.all(otList.map((x) => __awaiter(this, void 0, void 0, function* () {
                    const { SentByUserId, Img, EmailBody, EmailTitle } = x, rest = __rest(x, ["SentByUserId", "Img", "EmailBody", "EmailTitle"]);
                    const { UserId, FullName } = yield sql_utils_1.default.selectUserById(req.app.locals.db, SentByUserId);
                    return Object.assign(Object.assign({}, rest), { SentFromUser: { UserId, FullName } });
                })));
                return res.status(200).json({
                    message: "Get ot actual list success!",
                    data: otResult,
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    static postOTApprove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { UserId, FullName } = req.user;
                const { id, isApproved } = req.body;
                if (typeof isApproved !== "boolean" || !id) {
                    return res.status(406).json({ message: "Missing data" });
                }
                const mailer = new mail_utils_1.default();
                //Format email
                const emailTemplatePath = path_1.default.join(__dirname, "../templates/email/overtime-approval-template.hbs");
                const emailTemplate = fs_1.default.readFileSync(emailTemplatePath, "utf-8");
                const template = handlebars_1.default.compile(emailTemplate);
                const findOtRequest = yield sql_utils_1.default.selectOTRequestById(req.app.locals.db, id);
                if (!findOtRequest) {
                    return res.status(404).json({ message: "Not found request!" });
                }
                const { ProjectId, SentByUserId, OTUserIds, Approved, CCUserIds, EmailTitle, ToUserIds, OTFromDate, OTToDate } = findOtRequest, rest = __rest(findOtRequest, ["ProjectId", "SentByUserId", "OTUserIds", "Approved", "CCUserIds", "EmailTitle", "ToUserIds", "OTFromDate", "OTToDate"]);
                const sentBy = yield sql_utils_1.default.selectUserById(req.app.locals.db, SentByUserId);
                const toIds = String(ToUserIds)
                    .split(",")
                    .map((x) => Number(x.slice(1, x.length - 1)));
                const toUsers = yield sql_utils_1.default.selectUsersByIds(req.app.locals.db, toIds);
                const toUserNames = toUsers.map((x) => x.FullName);
                const toUserEmails = toUsers.map((x) => x.Email);
                const project = yield sql_utils_1.default.selectProjectById(req.app.locals.db, ProjectId);
                const ids = String(OTUserIds)
                    .split(",")
                    .map((x) => Number(x.slice(1, x.length - 1)));
                const personnel = yield sql_utils_1.default.selectUsersByIds(req.app.locals.db, ids);
                const otUsers = personnel.map((x) => x.FullName);
                const params = {
                    to: sentBy.FullName,
                    from: FullName,
                    froms: toUserNames.join(`, `),
                    projectName: project.ProjectName,
                    hours: findOtRequest.Hours,
                    fromDate: luxon_1.DateTime.fromJSDate(new Date(findOtRequest.OTFromDate)).toFormat("DD"),
                    toDate: luxon_1.DateTime.fromJSDate(new Date(findOtRequest.OTToDate)).toFormat("DD"),
                    totalDate: (new Date(findOtRequest.OTToDate).getTime() -
                        new Date(findOtRequest.OTFromDate).getTime()) /
                        (24 * 3600 * 1000) +
                        1,
                    schedule: findOtRequest.Session,
                    notes: findOtRequest.Notes ? findOtRequest.Notes : "...",
                    personnel: otUsers,
                    approvalStatus: isApproved ? "APPROVED" : "REFUSED",
                    approvalStatusLowercase: isApproved ? "approved" : "refused",
                };
                const emailContent = template(params);
                yield mailer.replyEmail({
                    from: "polaris@the-bim-factory.com",
                    to: [sentBy.Email],
                    cc: [
                        ...toUserEmails,
                        "hr@the-bim-factory.com",
                        "admin@the-bim-factory.com",
                    ],
                    subject: EmailTitle,
                    html: emailContent,
                });
                yield sql_utils_1.default.updateOTRequest(req.app.locals.db, id, isApproved ? 1 : 2, UserId
                // 88
                );
                return res
                    .status(200)
                    .json({ message: "Update OT request success!" });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    static postOTActualApprove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { UserId, FullName } = req.user;
                const { id, isApproved } = req.body;
                if (typeof isApproved !== "boolean" || !id) {
                    return res.status(406).json({ message: "Missing data" });
                }
                const mailer = new mail_utils_1.default();
                const findOtRequest = yield sql_utils_1.default.selectOTActualById(req.app.locals.db, id);
                if (!findOtRequest) {
                    return res.status(404).json({ message: "Not found request!" });
                }
                const { EmailTitle, EmailBody, SentByUserId, ToUserIds } = findOtRequest;
                const sentBy = yield sql_utils_1.default.selectUserById(req.app.locals.db, SentByUserId);
                const toIds = String(ToUserIds)
                    .split(",")
                    .map((x) => Number(x.slice(1, x.length - 1)));
                const toUsers = yield sql_utils_1.default.selectUsersByIds(req.app.locals.db, toIds);
                const toUserEmails = toUsers.map((x) => x.Email);
                const emailContent = `<body>
            <p>${sentBy.FullName} wrote:</p>
            <br />
            <div>
                ${EmailBody}
            </div>
            <p>-------------</p>
            <br />
            <p>Dear Mr/Ms ${sentBy.FullName},</p>
            <p><strong>This is ${isApproved ? "APPROVED" : "REFUSED"}.</strong></p>
            <br />
            <p>
                Dear HR & Admin, please note this has been
                ${isApproved ? "approved" : "refused"}.
            </p>
            <br />
            <p>Sincerely,</p>
            <p>${FullName}</p>
            </body>`;
                if (!sentBy.Email) {
                    return res
                        .status(404)
                        .json({ message: "NotFound user email!" });
                }
                yield mailer.replyEmail({
                    from: "polaris@the-bim-factory.com",
                    to: [sentBy.Email],
                    cc: [
                        ...toUserEmails,
                        "hr@the-bim-factory.com",
                        "admin@the-bim-factory.com",
                    ],
                    subject: EmailTitle,
                    html: emailContent,
                    attachments: {
                        filename: "image.jpg",
                        content: findOtRequest.Img,
                        contentType: "contentType",
                    },
                });
                yield sql_utils_1.default.updateOTActual(req.app.locals.db, id, isApproved ? 1 : 2, UserId
                // 88
                );
                return res
                    .status(200)
                    .json({ message: "Update OT actual success!" });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
}
exports.default = OvertimeController;
