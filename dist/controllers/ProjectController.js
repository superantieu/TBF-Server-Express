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
const pagination_utils_1 = require("../utils/pagination.utils");
//DEFINE
class ProjectController {
    static getUserProjects(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const projects = yield sql_utils_1.default.selectUserWIPProjects(req.app.locals.db, Number(id));
                return res
                    .status(200)
                    .json({ message: "Get users success!", data: projects });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    static getSpecificProjects(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { discipline, isCompleted, projectId, searchTerm, member, sortColumn, chooseProject, pageNumber, pageSize, } = req.query;
                const chooseResult = chooseProject
                    ? JSON.parse(chooseProject)
                    : undefined;
                const size = Number(pageSize) || 10;
                const page = Number(pageNumber) || 1;
                if (discipline) {
                    const { projects, count } = yield sql_utils_1.default.selectDisciplineProjects(req.app.locals.db, discipline, (0, pagination_utils_1.pagination)(page, size));
                    const totalCount = count.total;
                    const totalPage = Math.ceil(totalCount / size);
                    return res.status(200).json({
                        message: `Get ${discipline}'s projects success!`,
                        pagination: {
                            currentPage: page,
                            totalPages: totalPage,
                            pageSize: size,
                            totalCount: totalCount,
                        },
                        result: projects,
                    });
                }
                const { projects, count } = yield sql_utils_1.default.selectSpecificProjects(req.app.locals.db, Number(isCompleted), projectId, Number(member), searchTerm, sortColumn, chooseResult, (0, pagination_utils_1.pagination)(page, size));
                const totalCount = count.total;
                const totalPage = Math.ceil(totalCount / size);
                return res.status(200).json({
                    message: "Get projects success!",
                    pagination: {
                        currentPage: page,
                        totalPages: totalPage,
                        pageSize: size,
                        totalCount: totalCount,
                    },
                    result: projects,
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    static getSpecificCompactProjects(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projects = yield sql_utils_1.default.selectCompactProjects(req.app.locals.db);
                return res.status(200).json({
                    message: `Get projects projects success!`,
                    result: projects,
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
}
exports.default = ProjectController;
