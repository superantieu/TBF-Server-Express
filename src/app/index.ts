import express, { Express } from "express";
import { Server, Socket } from "socket.io";
import http from "http";
import { config } from "mssql";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import AppRouter from "../routers";
import {
    AppOptions,
    ClientToServerEvents,
    InterServerEvents,
    RouterObject,
    ServerToClientEvents,
    SocketData,
} from "../types";
import SqlDB from "../config/sqldb";

class App {
    public app: Express;
    private port: number;
    private dbConfig: config;
    private server: http.Server;
    private routers: RouterObject[];
    private io?: Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;
    private options?: AppOptions;

    constructor(
        port: number,
        dbConfig: config,
        routers: RouterObject[],
        options: AppOptions = { useMongoDB: false, useSocketIO: false }
    ) {
        this.app = express();
        this.port = port;
        this.dbConfig = dbConfig;
        this.server = new http.Server(this.app);
        this.routers = routers;
        this.options = options;
        this.initializeMiddlewares();
        this.initializeRouters();
        this.initializeDB();
        if (this.options.useSocketIO) {
            this.io = new Server<
                ClientToServerEvents,
                ServerToClientEvents,
                InterServerEvents,
                SocketData
            >(this.server);
            this.initializeSocket();
        }
    }
    //
    private async initializeDB() {
        const pool = new SqlDB(this.dbConfig);
        this.app.locals.db = await pool.connect();
    }
    //Middlewares
    private initializeMiddlewares() {
        this.app.use(
            cors({
                origin: "http://localhost:5173",
                methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                credentials: true,
            })
        );
        this.app.use(cookieParser());
        this.app.use(helmet());
        this.app.disable("x-powered-by");
        this.app.use(bodyParser.json({ limit: "60mb" }));
        this.app.use(bodyParser.urlencoded({ extended: true, limit: "60mb" }));
    }
    //Routers
    private initializeRouters() {
        const routes = new AppRouter(this.app);
        routes.initialize(this.routers);
    }
    //Websocket
    private initializeSocket() {
        this.io?.on(
            "connection",
            (
                socket: Socket<
                    ClientToServerEvents,
                    ServerToClientEvents,
                    InterServerEvents,
                    SocketData
                >
            ) => {
                console.log("Connected to Socket");
                //Handle socket events here
            }
        );
    }
    //Listen app
    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}

export default App;
