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
class EmployeeController {
    static getEmployees(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchTerm = (_a = req.query) === null || _a === void 0 ? void 0 : _a.searchTerm;
                const discipline = (_b = req.query) === null || _b === void 0 ? void 0 : _b.discipline;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const pageNumber = parseInt(req.query.pageNumber) || 1;
                if (searchTerm) {
                    const searchResult = yield sql_utils_1.default.selectSearchUsers(req.app.locals.db, searchTerm);
                    return res.status(200).json({
                        message: "Get search users success!",
                        result: searchResult,
                    });
                }
                const { data, count } = yield sql_utils_1.default.selectAllUsers(req.app.locals.db, discipline, (0, pagination_utils_1.pagination)(pageNumber, pageSize));
                const totalCount = count.total;
                const totalPage = Math.ceil(totalCount / pageSize);
                return res.status(200).json({
                    message: "Get users success!",
                    pagination: {
                        currentPage: pageNumber,
                        totalPages: totalPage,
                        pageSize: pageSize,
                        totalCount: totalCount,
                    },
                    result: data,
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
    static getSpecificEmployees(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const user = yield sql_utils_1.default.selectUser(req.app.locals.db, Number(userId));
                return res.status(200).json({
                    message: "Get users success!",
                    result: user,
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal server error!" });
            }
        });
    }
}
exports.default = EmployeeController;
