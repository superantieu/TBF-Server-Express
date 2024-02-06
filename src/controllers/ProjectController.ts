import { Request, Response } from "express";

import SqlUtils from "../utils/sql.utils";
import { pagination } from "../utils/pagination.utils";

//DEFINE
export default class ProjectController {
  static async getUserProjects(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const projects = await SqlUtils.selectUserWIPProjects(
        req.app.locals.db,
        Number(id)
      );
      return res
        .status(200)
        .json({ message: "Get users success!", data: projects });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
  static async getSpecificProjects(req: Request, res: Response) {
    try {
      const {
        discipline,
        isCompleted,
        projectId,
        searchTerm,
        member,
        sortColumn,
        chooseProject,
        pageNumber,
        pageSize,
      } = req.query;

      const chooseResult = chooseProject
        ? JSON.parse(chooseProject as string)
        : undefined;
      const size = Number(pageSize) || 10;
      const page = Number(pageNumber) || 1;
      if (discipline) {
        const { projects, count } = await SqlUtils.selectDisciplineProjects(
          req.app.locals.db,
          discipline as string,
          pagination(page, size)
        );
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
      const { projects, count } = await SqlUtils.selectSpecificProjects(
        req.app.locals.db,
        Number(isCompleted),
        projectId as string,
        Number(member),
        searchTerm as string,
        sortColumn as string,
        chooseResult,
        pagination(page, size)
      );
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
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
  static async getSpecificCompactProjects(req: Request, res: Response) {
    try {
      const projects = await SqlUtils.selectCompactProjects(req.app.locals.db);

      return res.status(200).json({
        message: `Get projects projects success!`,

        result: projects,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
  //Backup
  // static async getUserProjects(req: Request, res: Response) {
  //     try {
  //         const { id } = req.params;
  //         const projects = await SqlUtils.selectUserProjects(
  //             req.app.locals.db,
  //             Number(id)
  //         );
  //         return res
  //             .status(200)
  //             .json({ message: "Get users success!", data: projects });
  //     } catch (error) {
  //         console.log(error);
  //         return res.status(500).json({ message: "Internal server error!" });
  //     }
  // }
}
