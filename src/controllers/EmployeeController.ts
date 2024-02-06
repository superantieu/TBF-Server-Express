import { Request, Response } from "express";

import SqlUtils from "../utils/sql.utils";
import { pagination } from "../utils/pagination.utils";

//DEFINE
export default class EmployeeController {
  static async getEmployees(req: Request, res: Response) {
    try {
      const searchTerm = req.query?.searchTerm as string;
      const discipline = req.query?.discipline as string;
      const pageSize: number = parseInt(req.query.pageSize as string) || 10;
      const pageNumber: number = parseInt(req.query.pageNumber as string) || 1;

      if (searchTerm) {
        const searchResult = await SqlUtils.selectSearchUsers(
          req.app.locals.db,
          searchTerm
        );
        return res.status(200).json({
          message: "Get search users success!",
          result: searchResult,
        });
      }
      const { data, count } = await SqlUtils.selectAllUsers(
        req.app.locals.db,
        discipline,
        pagination(pageNumber, pageSize)
      );
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
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
  static async getSpecificEmployees(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await SqlUtils.selectUser(req.app.locals.db, Number(userId));
      return res.status(200).json({
        message: "Get users success!",
        result: user,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
}
