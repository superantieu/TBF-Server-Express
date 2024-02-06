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
const google_auth_library_1 = require("google-auth-library");
const nodemailer_1 = __importDefault(require("nodemailer"));
class MailUtils {
    constructor() {
        this.oauth2Client = new google_auth_library_1.OAuth2Client(process.env.MAILING_SERVICE_CLIENT_ID, process.env.MAILING_SERVICE_CLIENT_SECRET);
        this.oauth2Client.setCredentials({
            refresh_token: process.env.MAILING_SERVICE_REFRESH_TOKEN,
        });
    }
    sendEmail(to, cc, subject, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = yield this.oauth2Client.getAccessToken();
                if (token) {
                    let transporter = nodemailer_1.default.createTransport({
                        service: "gmail",
                        secure: false,
                        auth: {
                            type: "OAuth2",
                            user: process.env.MAILING_SERVICE_ADDRESS,
                            clientId: process.env.MAILING_SERVICE_CLIENT_ID,
                            clientSecret: process.env.MAILING_SERVICE_CLIENT_SECRET,
                            refreshToken: process.env.MAILING_SERVICE_REFRESH_TOKEN,
                            accessToken: token,
                        },
                        tls: { rejectUnauthorized: false },
                    });
                    const info = yield transporter.sendMail({
                        to,
                        cc,
                        subject,
                        html: content,
                    });
                    return info;
                }
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    replyEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = yield this.oauth2Client.getAccessToken();
                if (token) {
                    let transporter = nodemailer_1.default.createTransport({
                        service: "gmail",
                        secure: false,
                        auth: {
                            type: "OAuth2",
                            user: process.env.MAILING_SERVICE_ADDRESS,
                            clientId: process.env.MAILING_SERVICE_CLIENT_ID,
                            clientSecret: process.env.MAILING_SERVICE_CLIENT_SECRET,
                            refreshToken: process.env.MAILING_SERVICE_REFRESH_TOKEN,
                            accessToken: token,
                        },
                        tls: { rejectUnauthorized: false },
                    });
                    yield transporter.sendMail(options);
                }
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
}
exports.default = MailUtils;
