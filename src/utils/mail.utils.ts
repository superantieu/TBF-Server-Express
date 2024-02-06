import { OAuth2Client } from "google-auth-library";
import nodemailer, { Transporter } from "nodemailer";

export default class MailUtils {
    private oauth2Client: OAuth2Client;

    constructor() {
        this.oauth2Client = new OAuth2Client(
            process.env.MAILING_SERVICE_CLIENT_ID,
            process.env.MAILING_SERVICE_CLIENT_SECRET
        );
        this.oauth2Client.setCredentials({
            refresh_token: process.env.MAILING_SERVICE_REFRESH_TOKEN,
        });
    }
    public async sendEmail(
        to: string[],
        cc: string[],
        subject: string,
        content: string
    ) {
        try {
            const { token } = await this.oauth2Client.getAccessToken();
            if (token) {
                let transporter: Transporter = nodemailer.createTransport({
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
                const info = await transporter.sendMail({
                    to,
                    cc,
                    subject,
                    html: content,
                });
                return info;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    public async replyEmail(options: {
        from: string;
        to: string[];
        cc: string[];
        subject: string;
        html: string;
        attachments?: any;
    }) {
        try {
            const { token } = await this.oauth2Client.getAccessToken();
            if (token) {
                let transporter: Transporter = nodemailer.createTransport({
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
                await transporter.sendMail(options);
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
