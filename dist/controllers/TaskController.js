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
const sql_utils_1 = __importDefault(require("../utils/sql.utils"));
//DEFINE
class TaskController {
    static getUserTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!user) {
                    return res.status(403).json({ message: "Forbidden!" });
                }
                const tasks = yield sql_utils_1.default.selectUserTasks(req.app.locals.db, Number(user.UserId));
                return res
                    .status(200)
                    .json({ message: "Get tasks successfully!", data: tasks });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    static getUserTasksByUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    return res.status(404).json({ message: "Not Found" });
                }
                const tasks = yield sql_utils_1.default.selectUserTasks(req.app.locals.db, Number(id));
                return res
                    .status(200)
                    .json({ message: "Get tasks successfully!", data: tasks });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    // Sup
    // get specific task
    static getTasksByTaskId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { taskId } = req.params;
                if (!taskId) {
                    return res.status(404).json({ message: "Not Found" });
                }
                const tasks = yield sql_utils_1.default.selectTask(req.app.locals.db, Number(taskId));
                return res
                    .status(200)
                    .json({ message: "Get tasks successfully!", result: tasks });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    // get discipline name based on tbTask
    static getTasksDiscipline(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { searchTerm } = req.query;
                const tasks = yield sql_utils_1.default.selectTaskDiscipline(req.app.locals.db, searchTerm ? String(searchTerm) : "");
                return res
                    .status(200)
                    .json({ message: "Get tasks successfully!", result: tasks });
            }
            catch (error) {
                console.log("erroe", error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
}
exports.default = TaskController;
