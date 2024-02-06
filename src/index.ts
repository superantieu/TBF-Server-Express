import dotenv from "dotenv";
import { config } from "mssql";

import App from "./app";
import routes from "./routers/routes";

dotenv.config();
const PORT = process.env.PORT;
const config: config = {
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
    trustServerCertificate: true, // change to true for local dev / self-signed certs
    trustedConnection: true,
  },
};

const server = new App(PORT, config, routes, { useSocketIO: true });
server.listen();
