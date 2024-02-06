import { ConnectionPool, IRecordSet } from "mssql";

import { ILeaveRequest } from "../models/LeaveRequestModel";
import { ITimesheet } from "../models/TimesheetModel";
import { INotification } from "../models/Notification";
import removeAccents from "./removeAccents";

export default class SqlUtils {
  static selectUserById = async (pool: ConnectionPool, id: number) => {
    try {
      const find = await pool
        .request()
        .input("id", id)
        .query(`SELECT * FROM tbUser WHERE UserId= @id`);

      return find.recordset[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  static selectUserByEmail = async (pool: ConnectionPool, email: string) => {
    try {
      const find = await pool
        .request()
        .input("email", email)
        .query(`SELECT * FROM tbUser WHERE Email= @email`);

      return find.recordset[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  static selectAccessRights = async (pool: ConnectionPool, appName: string) => {
    try {
      const find = await pool
        .request()
        .query(`SELECT ${appName} FROM tbAccessRights`);
      return find.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  static selectProjectById = async (pool: ConnectionPool, id: number) => {
    try {
      const find = await pool
        .request()
        .input("id", id)
        .query(`SELECT * FROM tbProject WHERE ProjectId= @id`);
      return find.recordset[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  static selectUsersByIds = async (pool: ConnectionPool, ids: number[]) => {
    try {
      if (ids.length < 1) {
        return [];
      }
      const find = await pool
        .request()
        .query(
          `SELECT * FROM tbUser WHERE UserId IN (${ids.map((id) =>
            String(id)
          )})`
        );

      return find.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  static updateSettings = async (
    pool: ConnectionPool,
    id: number,
    token: string
  ) => {
    try {
      const setting = await pool
        .request()
        .input("userId", id)
        .input("token", token)
        .query(`UPDATE tbSettings SET Token = @token WHERE UserId = @userId`);
      return setting.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  static updateUserPassword = async (
    pool: ConnectionPool,
    id: number,
    pass: string
  ) => {
    try {
      const setting = await pool
        .request()
        .input("userId", id)
        .input("password", pass)
        .query(`UPDATE tbUser SET Password = @password WHERE UserId = @userId`);
      return setting.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  static selectUserSettings = async (pool: ConnectionPool, id: number) => {
    try {
      const find = await pool
        .request()
        .input("userId", id)
        .query(`SELECT Token FROM tbSettings WHERE UserId = @userId`);
      return find.recordset[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  static selectAllUsers = async (
    pool: ConnectionPool,
    discipline?: string,
    paginationQuery?: string
  ) => {
    try {
      const select = `SELECT UserId, FullName, Discipline, JobTitle `;
      const count = `select count(*) as total `;
      const query = `FROM tbUser WHERE Employed = 1 ${
        discipline ? `and Discipline = '${discipline}' ` : ""
      }`;
      const pagi = `ORDER BY UserId ${paginationQuery}`;

      const find = await pool.request().query(select + query + pagi);
      const total = await pool.request().query(count + query);

      return {
        data: find.recordset,
        count: total.recordset[0],
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  static selectSearchUsers = async (
    pool: ConnectionPool,
    searchTerm: string
  ) => {
    try {
      const search = removeAccents(searchTerm).toLowerCase();
      const query = `SELECT UserId, FullName, Discipline, JobTitle
      FROM tbUser`;
      const searchResult: Array<any> = [];
      const find = await pool.request().query(query);
      console.log("length", find.recordset.length);
      for (let i = 0; i < find.recordset.length; i++) {
        if (
          removeAccents(find.recordset[i]["FullName"])
            .toLowerCase()
            .includes(search)
        ) {
          searchResult.push(find.recordset[i]);
        }
        if (searchResult.length === 10) {
          break;
        }
      }
      return searchResult;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  static selectUser = async (pool: ConnectionPool, userId: number) => {
    try {
      const query = `SELECT UserId, FullName, Discipline, JobTitle
      FROM tbUser WHERE UserId = ${userId}`;

      const find = await pool.request().query(query);

      return find.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  static selectAllProjects = async (pool: ConnectionPool) => {
    try {
      const projects = await pool
        .request()
        .query(`SELECT ProjectId, ProjectName FROM tbProject`);
      return projects.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  static selectUserProjects = async (pool: ConnectionPool, id: number) => {
    try {
      const projects = await pool.request().query(
        `SELECT ProjectId, ProjectName, CompletedDate FROM tbProject 
          WHERE ListMember LIKE '%(${id})%' OR ListLeader LIKE '%(${id})%' OR ListManager LIKE '%(${id})%'`
      );
      return projects.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  static selectUserLeaveRequest = async (
    pool: ConnectionPool,
    email: string
  ) => {
    try {
      const projects = await pool
        .request()
        .input("toEmail", email)
        .query(
          `SELECT * FROM tbLeave WHERE ToEmail = @toEmail AND Approved = 0`
        );
      return projects.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  static async selectUserTimesheet(
    pool: ConnectionPool,
    date: string,
    userId: number
  ) {
    try {
      const timesheet = await pool
        .request()
        .input("userId", userId)
        .query(
          `SELECT * FROM tbTimeSheet WHERE UserId = @userId AND TSDate >= '${date}' AND TSDate <= '${date}'`
        );
      return timesheet.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async selectUserTimesheetByProjectId(
    pool: ConnectionPool,
    projectId: string
  ) {
    try {
      const timesheet = await pool.request().query(
        `SELECT 
          TS.[Id], TS.[TaskId], TS.[ProjectId], TS.[UserId], TS.[UserId],
          TS.[UserId], U.[FullName], TS.[UserDiscipline], TS.[TSHour]   
      FROM 
          [Polaris].[dbo].[tbTimeSheet] AS TS
      JOIN
          [Polaris].[dbo].[tbUser] AS U ON TS.UserId = U.UserId
      WHERE 
          TS.ProjectId = '${projectId}';`
      );
      return timesheet.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async updateUserTimesheet(pool: ConnectionPool, payload: ITimesheet) {
    try {
      const timesheet = await pool
        .request()
        .input("userId", payload.UserId)
        .input("tsHour", payload.TSHour)
        .input("taskId", payload.TaskId)
        .input("projectId", payload.ProjectId)
        .query(
          `UPDATE tbTimeSheet SET TSHour = @tsHour WHERE UserId = @userId AND TaskId=@taskId 
          AND ProjectId=@projectId AND TSDate >= '${payload.TSDate}' AND TSDate <= '${payload.TSDate}'`
        );
      return timesheet.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async selectUserTimesheets(
    pool: ConnectionPool,
    monthYear: string,
    userId: number,
    taskId: number,
    projectId: string
  ) {
    try {
      const timesheet = await pool
        .request()
        .input("userId", userId)
        .input("taskId", taskId)
        .input("projectId", projectId)
        .query(
          `SELECT * FROM tbTimeSheet WHERE UserId = @userId AND TaskId = @taskId AND ProjectId = @projectId AND TSDate LIKE '${monthYear}%'`
        );
      return timesheet.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async selectUserTasks(pool: ConnectionPool, id: number) {
    try {
      const findTasks = await pool.request().query(
        `SELECT tbTask.*, tbProject.ProjectName, tbProject.CompletedDate 
        FROM tbTask LEFT JOIN tbProject ON tbTask.ProjectId=tbProject.ProjectId 
        WHERE UserIds LIKE '%(${id})%' OR tbTask.ProjectId='TBF-000-LEAVE' OR tbTask.ProjectId='01_23-11-02_10-13-53'`
      );
      return findTasks.recordset;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async selectTask(pool: ConnectionPool, id: number) {
    try {
      const findTasks = await pool.request().query(
        `SELECT  [TaskId], [ProjectId], [TaskDiscipline], [Name]   
      FROM [Polaris].[dbo].[tbTask]
      WHERE TaskId=${id}`
      );
      return findTasks.recordset;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async selectTaskDiscipline(pool: ConnectionPool, searchTerm: string) {
    try {
      let query = `SELECT [TaskId], [ProjectId], [TaskDiscipline]
      FROM tbTask
      WHERE TaskId IN 
        (SELECT top 1 TaskId 
          FROM tbTask AS innerTask
          WHERE innerTask.TaskDiscipline = tbTask.TaskDiscipline
          ORDER BY innerTask.TaskId)
      AND lower(TaskDiscipline) like '%' + lower('${searchTerm}') + '%'`;

      const findTasks = await pool.request().query(query);
      return findTasks.recordset;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async selectUserWIPProjects(pool: ConnectionPool, id: number) {
    try {
      const findTasks = await pool
        .request()
        .query(
          `Select ProjectName From tbProject where ProjectId In (SELECT ProjectId FROM tbTask Where UserIds LIKE '%(${id})%' And FinishedDate IS NULL)`
        );
      return findTasks.recordset;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async selectDisciplineProjects(
    pool: ConnectionPool,
    discipline: string,
    paginationQuery?: string
  ) {
    try {
      const select = `SELECT p.ProjectName, p.ProjectId,StartDate, TargetDate, CompletedDate
            ,TotalHours, [FloorAreas], [ListMember], [ListLeader], [ListManager] `;
      const count = `SELECT count(p.ProjectId) as total `;
      const query = `FROM tbProject p WHERE EXISTS 
        (SELECT 1 FROM tbTask t
          WHERE t.ProjectId = p.ProjectId
          AND t.TaskDiscipline = '${discipline}') `;
      const order = `ORDER BY p.ProjectId ${paginationQuery}`;
      const findProject = await pool.request().query(select + query + order);
      const total = await pool.request().query(count + query);

      const projects = findProject.recordset;
      //Add some fields
      for (let i = 0; i < projects.length; i++) {
        //Count Tasks
        const TaskCount = await pool.request()
          .query(`SELECT COUNT(*) AS TaskCount
        FROM TbTask
        WHERE ProjectId = '${projects[i]["ProjectId"]}'`);

        //Filter Members
        const members = await pool.request()
          .query(`SELECT u.UserId, u.FullName, u.Discipline, u.JobTitle, SUM(ts.Tshour) AS UserHours
          FROM TbTimeSheet ts INNER JOIN TbUser u ON ts.UserId = u.UserId
          WHERE ts.ProjectId = '${projects[i]["ProjectId"]}'
          GROUP BY u.UserId, u.FullName, u.Discipline, u.JobTitle;`);

        // Return projects
        projects[i]["Tasks"] = TaskCount.recordset[0]["TaskCount"];
        projects[i]["FilterMembers"] = members.recordset;
      }
      return {
        projects: projects,
        count: total.recordset[0],
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async selectCompactProjects(pool: ConnectionPool) {
    try {
      const findProject = await pool.request().query(
        `SELECT p.ProjectName, p.ProjectId
        FROM tbProject p
        WHERE p.CompletedDate IS NULL
		    AND p.ProjectName != 'LEAVE'`
      );

      return findProject.recordset;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async selectSpecificProjects(
    pool: ConnectionPool,
    isCompleted?: number,
    projectId?: string,
    member?: number,
    searchTerm?: string,
    sortColumn?: string,
    chooseProject?: string[],
    paginationQuery?: string
  ) {
    try {
      const q = chooseProject?.join("','");
      const select = `SELECT p.ProjectId, p.ProjectName, StartDate, TargetDate, CompletedDate, TotalHours,
                  Location, Size, [Difficulty], [FloorAreas], [ListMember], [ListLeader], [ListManager],
                  SUM(t.Tshour) AS UsedHours `;
      const count = `SELECT count(*) as total FROM (SELECT SUM(t.Tshour) AS UsedHours `;
      // const count = `SELECT count(*) as total `;
      const query = `FROM tbTimeSheet as t JOIN tbProject as p ON t.ProjectId=p.ProjectId     
          WHERE
          (@isCompleted IS NULL OR (@isCompleted = 1 AND p.CompletedDate IS NOT NULL) OR (@isCompleted = 0 AND p.CompletedDate IS NULL))
          AND p.ProjectName != 'LEAVE'
          AND (t.ProjectId = @projectId or  @projectId IS NULL)
          AND ((p.[ListMember] like '%${member}%' or p.[ListLeader] like '%${member}%' or p.ListManager like '%${member}%') OR @member IS NULL)       
          AND (p.ProjectName LIKE '%' + @searchTerm + '%' OR @searchTerm IS NULL)  
          ${chooseProject ? `AND p.ProjectId in ('${q}')` : ""} 
          GROUP BY p.ProjectId, p.ProjectName, p.StartDate, p.TargetDate, p.CompletedDate, p.TotalHours, p.Location,
              p.Size, p.[Difficulty], [FloorAreas], [ListMember], [ListLeader], [ListManager] `;
      // Select projects
      const order = `ORDER BY ${
        sortColumn ? `p.${sortColumn}` : `p.ProjectId`
      } ${paginationQuery}`;
      const findProject = await pool
        .request()
        .input("isCompleted", isCompleted)
        .input("projectId", projectId)
        .input("member", member)
        .input("searchTerm", searchTerm)
        .query(select + query + order);
      // Count
      const total = await pool
        .request()
        .input("isCompleted", isCompleted)
        .input("projectId", projectId)
        .input("member", member)
        .input("searchTerm", searchTerm)
        .query(count + query + ") AS SubQueryAlias");
      const projects = findProject.recordset;

      //Add some fields
      for (let i = 0; i < projects.length; i++) {
        //Count Tasks
        const TaskCount = await pool.request()
          .query(`SELECT COUNT(*) AS TaskCount
        FROM TbTask WHERE ProjectId = '${projects[i]["ProjectId"]}'`);

        //Filter Members
        const members = await pool.request()
          .query(`SELECT u.UserId, u.FullName, u.Discipline, u.JobTitle, SUM(ts.Tshour) AS UserHours
          FROM TbTimeSheet ts INNER JOIN TbUser u ON ts.UserId = u.UserId
          WHERE ts.ProjectId = '${projects[i]["ProjectId"]}'
          GROUP BY u.UserId, u.FullName, u.Discipline, u.JobTitle;`);

        // Return projects
        projects[i]["Tasks"] = TaskCount.recordset[0]["TaskCount"];
        projects[i]["FilterMembers"] = members.recordset;
      }

      return {
        projects: projects,
        count: total.recordset[0],
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async insertLeaveRequest(
    pool: ConnectionPool,
    payload: ILeaveRequest
  ) {
    const {
      UserId,
      ToEmail,
      CCEmails,
      SentDate,
      LeaveType,
      LeaveFrom,
      LeaveTimeFrom,
      LeaveTo,
      LeaveTimeTo,
      CountDays,
      Reason,
      HandlerId,
      ProjectNotComplete,
      Approved,
      Subject,
      MailId,
    } = payload;
    const values = `(${UserId},'${ToEmail}','${CCEmails}', '${SentDate}', '${LeaveType}', '${LeaveFrom}', '${LeaveTimeFrom}', '${LeaveTo}','${LeaveTimeTo}', '${CountDays}', N'${Reason.replace(
      "'",
      " "
    ).replace(`"`, " ")}', ${HandlerId}, '${ProjectNotComplete}', ${
      Approved as number
    },'${Subject}','${MailId}')`;
    try {
      await pool
        .request()
        .query(
          `INSERT INTO tbLeave (${Object.keys(payload) + ""}) VALUES ${values}`
        );
      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async insertTimesheet(pool: ConnectionPool, payload: ITimesheet) {
    const {
      TaskId,
      ProjectId,
      UserId,
      UserDiscipline,
      ProjectRule,
      TSDate,
      TSHour,
      Adjustments,
      Autoload,
    } = payload;
    const values = `(${TaskId},'${ProjectId}','${UserId}','${UserDiscipline}','${ProjectRule}','${TSDate}','${TSHour}','${Adjustments}','${Autoload}')`;
    try {
      await pool
        .request()
        .query(
          `INSERT INTO tbTimeSheet (${
            Object.keys(payload) + ""
          }) VALUES ${values}`
        );
      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async deleteTimesheet(pool: ConnectionPool, payload: ITimesheet) {
    const { TaskId, ProjectId, UserId, TSDate } = payload;
    try {
      await pool
        .request()
        .input("userId", UserId)
        .input("taskId", TaskId)
        .input("projectId", ProjectId)
        .query(
          `DELETE FROM tbTimeSheet WHERE UserId=@userId AND TaskId=@taskId AND ProjectId=@projectId AND TSDate >='${TSDate}' AND TSDate <= '${TSDate}'`
        );
      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async insertNotifications(
    pool: ConnectionPool,
    payload: INotification
  ) {
    const { Timestamp, UserId, Type, Msg, IsRead } = payload;
    const values = `'${Timestamp}','${UserId}','${Type}',N'${Msg.replace(
      "'",
      " "
    ).replace(`"`, " ")}','${IsRead}'`;
    try {
      await pool
        .request()
        .query(
          `INSERT INTO tbNotifications (${
            Object.keys(payload) + ""
          }) VALUES (${values})`
        );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  //OT queries
  static selectAllOTRequest = async (pool: ConnectionPool, userId: number) => {
    try {
      const otRequest = await pool
        .request()
        .query(
          `SELECT * FROM tbOvertimeRequest WHERE ToUserIds LIKE '%(${userId})%' And Approved = 0`
        );
      return otRequest.recordset;
    } catch (error) {
      throw error;
    }
  };
  static selectOTRequestById = async (pool: ConnectionPool, id: number) => {
    try {
      const otRequest = await pool
        .request()
        .input("id", id)
        .query(`SELECT * FROM tbOvertimeRequest WHERE Id=@id`);
      return otRequest.recordset[0];
    } catch (error) {
      throw error;
    }
  };
  static selectAllOTActual = async (pool: ConnectionPool, userId: number) => {
    try {
      const otRequest = await pool
        .request()
        .query(
          `SELECT * FROM tbOvertimeActual WHERE ToUserIds LIKE '%(${userId})%' And Approved = 0`
        );
      return otRequest.recordset;
    } catch (error) {
      throw error;
    }
  };
  static selectOTActualById = async (pool: ConnectionPool, id: number) => {
    try {
      const otRequest = await pool
        .request()
        .input("id", id)
        .query(`SELECT * FROM tbOvertimeActual WHERE Id=@id`);
      return otRequest.recordset[0];
    } catch (error) {
      throw error;
    }
  };

  static updateOTRequest = async (
    pool: ConnectionPool,
    id: number,
    isApproved: number,
    userId: number
  ) => {
    try {
      const otRequest = await pool
        .request()
        .input("id", id)
        .input("isApproved", isApproved)
        .query(
          `UPDATE tbOvertimeRequest SET Approved = @isApproved WHERE Id = @id AND ToUserIds LIKE '%(${userId})%'`
        );
      return otRequest.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  static updateOTActual = async (
    pool: ConnectionPool,
    id: number,
    isApproved: number,
    userId: number
  ) => {
    try {
      const otRequest = await pool
        .request()
        .input("id", id)
        .input("isApproved", isApproved)
        .query(
          `UPDATE tbOvertimeActual SET Approved = @isApproved WHERE Id = @id AND ToUserIds LIKE '%(${userId})%'`
        );
      return otRequest.recordset;
    } catch (error) {
      throw error;
    }
  };

  // Leave table
  static selectLeaveRequestById = async (pool: ConnectionPool, id: number) => {
    try {
      const otRequest = await pool
        .request()
        .input("id", id)
        .query(`SELECT * FROM tbLeave WHERE Id=@id`);
      return otRequest.recordset[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  static updateLeaveRequest = async (
    pool: ConnectionPool,
    id: number,
    isApproved: number
  ) => {
    try {
      const otRequest = await pool
        .request()
        .input("id", id)
        .input("isApproved", isApproved)
        .query(`UPDATE tbLeave SET Approved = @isApproved WHERE Id = @id`);
      return otRequest.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Select holidays
  static selectAllHolidays = async (pool: ConnectionPool) => {
    try {
      const projects = await pool.request().query(`SELECT * FROM tbHoliday`);
      return projects.recordset;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}
