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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mail_utils_1 = __importDefault(require("../utils/mail.utils"));
const sql_utils_1 = __importDefault(require("../utils/sql.utils"));
//DEFINE
class OffsetTimeController {
    static sendOffsetTime(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { toManager, cc, fromDateTime, toDateTime, reason, makeUpTime, handler, totalHours, } = req.body;
                const toUser = yield sql_utils_1.default.selectUserById(req.app.locals.db, toManager.value);
                const userSend = yield sql_utils_1.default.selectUserById(req.app.locals.db, user.UserId);
                const handlerUser = yield sql_utils_1.default.selectUserById(req.app.locals.db, handler.value);
                //Email payload
                const subject = `OFFSET TIME | ${user.UserId}-${user.FullName.toUpperCase()} | ${user.Discipline.toUpperCase()} ${user.JobTitle.toUpperCase()}`;
                const content = `<div>Dear ${toUser.Sex === "Male" ? "Mr" : "Ms"} ${toUser.FullName},<br/> Could you approve my offset time request as per details below, please?<br/><br/><b>Check-Out:</b>(${totalHours}) hour(s)<br/>&emsp;from:&emsp;${fromDateTime.replace("T", " ")}<br/>&emsp;to:&emsp;&emsp;${toDateTime.replace("T", " ")}<br/><b>Reason:</b>${reason}<br/><b>Make-Up Time:</b>${makeUpTime}<br/><b>Handler:</b>${handler.label}<br/>Looking forward for your approval. Thank you.<br/><br/>
      Best regards,<br/><b>${user.FullName}</b></div>`;
                //Send mail
                const ccIds = cc
                    .map((e) => Number(e.value))
                    .filter((e) => e !== 0 &&
                    e !== toUser.UserId &&
                    e !== handlerUser.UserId);
                const ccUsers = yield sql_utils_1.default.selectUsersByIds(req.app.locals.db, ccIds);
                const ccEmails = ccUsers.map((user) => user.Email);
                let allCCEmails = [
                    ...ccEmails,
                    handlerUser.Email,
                    userSend.Email,
                ];
                const mailUtils = new mail_utils_1.default();
                yield mailUtils.sendEmail(
                // ["chuong.do@the-bim-factory.com"],
                // ["chuong.do@the-bim-factory.com"],
                [toUser.Email], [
                    "admin@the-bim-factory.com",
                    "hr@the-bim-factory.com",
                    ...allCCEmails.map((e) => `${e}`),
                ], subject, content);
                return res
                    .status(200)
                    .json({ message: "Offset time resquest sent" });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
exports.default = OffsetTimeController;
