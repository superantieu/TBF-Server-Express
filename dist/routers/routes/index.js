"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = __importDefault(require("./auth"));
const home_1 = __importDefault(require("./home"));
const employee_1 = __importDefault(require("./employee"));
const project_1 = __importDefault(require("./project"));
const absence_1 = __importDefault(require("./absence"));
const task_1 = __importDefault(require("./task"));
const timesheet_1 = __importDefault(require("./timesheet"));
const offsettime_1 = __importDefault(require("./offsettime"));
const accessright_1 = __importDefault(require("./accessright"));
const overtime_1 = __importDefault(require("./overtime"));
const routes = [
    {
        path: "/api/ot",
        router: new overtime_1.default().getRouter(),
    },
    {
        path: "/api/accessrights",
        router: new accessright_1.default().getRouter(),
    },
    {
        path: "/api/offsettime",
        router: new offsettime_1.default().getRouter(),
    },
    {
        path: "/api/absence",
        router: new absence_1.default().getRouter(),
    },
    {
        path: "/api/timesheet",
        router: new timesheet_1.default().getRouter(),
    },
    {
        path: "/api/task",
        router: new task_1.default().getRouter(),
    },
    {
        path: "/api/project",
        router: new project_1.default().getRouter(),
    },
    {
        path: "/api/employee",
        router: new employee_1.default().getRouter(),
    },
    {
        path: "/api/auth",
        router: new auth_1.default().getRouter(),
    },
    {
        path: "/api",
        router: new home_1.default().getRouter(),
    },
];
exports.default = routes;
