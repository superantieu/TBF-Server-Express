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
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const routers_1 = __importDefault(require("../routers"));
const sqldb_1 = __importDefault(require("../config/sqldb"));
class App {
    constructor(port, dbConfig, routers, options = { useMongoDB: false, useSocketIO: false }) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.dbConfig = dbConfig;
        this.server = new http_1.default.Server(this.app);
        this.routers = routers;
        this.options = options;
        this.initializeMiddlewares();
        this.initializeRouters();
        this.initializeDB();
        if (this.options.useSocketIO) {
            this.io = new socket_io_1.Server(this.server);
            this.initializeSocket();
        }
    }
    //
    initializeDB() {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = new sqldb_1.default(this.dbConfig);
            this.app.locals.db = yield pool.connect();
        });
    }
    //Middlewares
    initializeMiddlewares() {
        this.app.use((0, cors_1.default)({
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true,
        }));
        this.app.use((0, cookie_parser_1.default)());
        this.app.use((0, helmet_1.default)());
        this.app.disable("x-powered-by");
        this.app.use(body_parser_1.default.json({ limit: "60mb" }));
        this.app.use(body_parser_1.default.urlencoded({ extended: true, limit: "60mb" }));
    }
    //Routers
    initializeRouters() {
        const routes = new routers_1.default(this.app);
        routes.initialize(this.routers);
    }
    //Websocket
    initializeSocket() {
        var _a;
        (_a = this.io) === null || _a === void 0 ? void 0 : _a.on("connection", (socket) => {
            console.log("Connected to Socket");
            //Handle socket events here
        });
    }
    //Listen app
    listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}
exports.default = App;
