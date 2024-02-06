"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const routes_1 = __importDefault(require("./routers/routes"));
dotenv_1.default.config();
const PORT = process.env.PORT;
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT),
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    options: {
        // encrypt: true, // for azure
        trustServerCertificate: true,
        trustedConnection: true,
    },
};
const server = new app_1.default(PORT, config, routes_1.default, { useSocketIO: true });
server.listen();
