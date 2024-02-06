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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const removeAccents_1 = __importDefault(require("./removeAccents"));
class SqlUtils {
    static selectUserTimesheet(pool, date, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timesheet = yield pool
                    .request()
                    .input("userId", userId)
                    .query(`SELECT * FROM tbTimeSheet WHERE UserId = @userId AND TSDate >= '${date}' AND TSDate <= '${date}'`);
                return timesheet.recordset;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    static selectUserTimesheetByProjectId(pool, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timesheet = yield pool.request().query(`SELECT 
          TS.[Id], TS.[TaskId], TS.[ProjectId], TS.[UserId], TS.[UserId],
          TS.[UserId], U.[FullName], TS.[UserDiscipline], TS.[TSHour]   
      FROM 
          [Polaris].[dbo].[tbTimeSheet] AS TS
      JOIN
          [Polaris].[dbo].[tbUser] AS U ON TS.UserId = U.UserId
      WHERE 
          TS.ProjectId = '${projectId}';`);
                return timesheet.recordset;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    static updateUserTimesheet(pool, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timesheet = yield pool
                    .request()
                    .input("userId", payload.UserId)
                    .input("tsHour", payload.TSHour)
                    .input("taskId", payload.TaskId)
                    .input("projectId", payload.ProjectId)
                    .query(`UPDATE tbTimeSheet SET TSHour = @tsHour WHERE UserId = @userId AND TaskId=@taskId 
          AND ProjectId=@projectId AND TSDate >= '${payload.TSDate}' AND TSDate <= '${payload.TSDate}'`);
                return timesheet.recordset;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    static selectUserTimesheets(pool, monthYear, userId, taskId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timesheet = yield pool
                    .request()
                    .input("userId", userId)
                    .input("taskId", taskId)
                    .input("projectId", projectId)
                    .query(`SELECT * FROM tbTimeSheet WHERE UserId = @userId AND TaskId = @taskId AND ProjectId = @projectId AND TSDate LIKE '${monthYear}%'`);
                return timesheet.recordset;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    static selectUserTasks(pool, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findTasks = yield pool.request().query(`SELECT tbTask.*, tbProject.ProjectName, tbProject.CompletedDate 
        FROM tbTask LEFT JOIN tbProject ON tbTask.ProjectId=tbProject.ProjectId 
        WHERE UserIds LIKE '%(${id})%' OR tbTask.ProjectId='TBF-000-LEAVE' OR tbTask.ProjectId='01_23-11-02_10-13-53'`);
                return findTasks.recordset;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    static selectTask(pool, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findTasks = yield pool.request().query(`SELECT  [TaskId], [ProjectId], [TaskDiscipline], [Name]   
      FROM [Polaris].[dbo].[tbTask]
      WHERE TaskId=${id}`);
                return findTasks.recordset;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    static selectTaskDiscipline(pool, searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = `SELECT [TaskId], [ProjectId], [TaskDiscipline]
      FROM tbTask
      WHERE TaskId IN 
        (SELECT top 1 TaskId 
          FROM tbTask AS innerTask
          WHERE innerTask.TaskDiscipline = tbTask.TaskDiscipline
          ORDER BY innerTask.TaskId)
      AND lower(TaskDiscipline) like '%' + lower('${searchTerm}') + '%'`;
                const findTasks = yield pool.request().query(query);
                return findTasks.recordset;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    static selectUserWIPProjects(pool, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findTasks = yield pool
                    .request()
                    .query(`Select ProjectName From tbProject where ProjectId In (SELECT ProjectId FROM tbTask Where UserIds LIKE '%(${id})%' And FinishedDate IS NULL)`);
                return findTasks.recordset;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    static selectDisciplineProjects(pool, discipline, paginationQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const select = `SELECT p.ProjectName, p.ProjectId,StartDate, TargetDate, CompletedDate
            ,TotalHours, [FloorAreas], [ListMember], [ListLeader], [ListManager] `;
                const count = `SELECT count(p.ProjectId) as total `;
                const query = `FROM tbProject p WHERE EXISTS 
        (SELECT 1 FROM tbTask t
          WHERE t.ProjectId = p.ProjectId
          AND t.TaskDiscipline = '${discipline}') `;
                const order = `ORDER BY p.ProjectId ${paginationQuery}`;
                const findProject = yield pool.request().query(select + query + order);
                const total = yield pool.request().query(count + query);
                const projects = findProject.recordset;
                //Add some fields
                for (let i = 0; i < projects.length; i++) {
                    //Count Tasks
                    const TaskCount = yield pool.request()
                        .query(`SELECT COUNT(*) AS TaskCount
        FROM TbTask
        WHERE ProjectId = '${projects[i]["ProjectId"]}'`);
                    //Filter Members
                    const members = yield pool.request()
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
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    static selectCompactProjects(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findProject = yield pool.request().query(`SELECT p.ProjectName, p.ProjectId
        FROM tbProject p
        WHERE p.CompletedDate IS NULL
		    AND p.ProjectName != 'LEAVE'`);
                return findProject.recordset;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    static selectSpecificProjects(pool, isCompleted, projectId, member, searchTerm, sortColumn, chooseProject, paginationQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const q = chooseProject === null || chooseProject === void 0 ? void 0 : chooseProject.join("','");
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
                const order = `ORDER BY ${sortColumn ? `p.${sortColumn}` : `p.ProjectId`} ${paginationQuery}`;
                const findProject = yield pool
                    .request()
                    .input("isCompleted", isCompleted)
                    .input("projectId", projectId)
                    .input("member", member)
                    .input("searchTerm", searchTerm)
                    .query(select + query + order);
                // Count
                const total = yield pool
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
                    const TaskCount = yield pool.request()
                        .query(`SELECT COUNT(*) AS TaskCount
        FROM TbTask WHERE ProjectId = '${projects[i]["ProjectId"]}'`);
                    //Filter Members
                    const members = yield pool.request()
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
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    static insertLeaveRequest(pool, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { UserId, ToEmail, CCEmails, SentDate, LeaveType, LeaveFrom, LeaveTimeFrom, LeaveTo, LeaveTimeTo, CountDays, Reason, HandlerId, ProjectNotComplete, Approved, Subject, MailId, } = payload;
            const values = `(${UserId},'${ToEmail}','${CCEmails}', '${SentDate}', '${LeaveType}', '${LeaveFrom}', '${LeaveTimeFrom}', '${LeaveTo}','${LeaveTimeTo}', '${CountDays}', N'${Reason.replace("'", " ").replace(`"`, " ")}', ${HandlerId}, '${ProjectNotComplete}', ${Approved},'${Subject}','${MailId}')`;
            try {
                yield pool
                    .request()
                    .query(`INSERT INTO tbLeave (${Object.keys(payload) + ""}) VALUES ${values}`);
                return true;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    static insertTimesheet(pool, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { TaskId, ProjectId, UserId, UserDiscipline, ProjectRule, TSDate, TSHour, Adjustments, Autoload, } = payload;
            const values = `(${TaskId},'${ProjectId}','${UserId}','${UserDiscipline}','${ProjectRule}','${TSDate}','${TSHour}','${Adjustments}','${Autoload}')`;
            try {
                yield pool
                    .request()
                    .query(`INSERT INTO tbTimeSheet (${Object.keys(payload) + ""}) VALUES ${values}`);
                return true;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    static deleteTimesheet(pool, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { TaskId, ProjectId, UserId, TSDate } = payload;
            try {
                yield pool
                    .request()
                    .input("userId", UserId)
                    .input("taskId", TaskId)
                    .input("projectId", ProjectId)
                    .query(`DELETE FROM tbTimeSheet WHERE UserId=@userId AND TaskId=@taskId AND ProjectId=@projectId AND TSDate >='${TSDate}' AND TSDate <= '${TSDate}'`);
                return true;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    static insertNotifications(pool, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Timestamp, UserId, Type, Msg, IsRead } = payload;
            const values = `'${Timestamp}','${UserId}','${Type}',N'${Msg.replace("'", " ").replace(`"`, " ")}','${IsRead}'`;
            try {
                yield pool
                    .request()
                    .query(`INSERT INTO tbNotifications (${Object.keys(payload) + ""}) VALUES (${values})`);
                return true;
            }
            catch (error) {
                console.log(error);
                return false;
            }
        });
    }
}
exports.default = SqlUtils;
_a = SqlUtils;
SqlUtils.selectUserById = (pool, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = yield pool
            .request()
            .input("id", id)
            .query(`SELECT * FROM tbUser WHERE UserId= @id`);
        return find.recordset[0];
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.selectUserByEmail = (pool, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = yield pool
            .request()
            .input("email", email)
            .query(`SELECT * FROM tbUser WHERE Email= @email`);
        return find.recordset[0];
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.selectAccessRights = (pool, appName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = yield pool
            .request()
            .query(`SELECT ${appName} FROM tbAccessRights`);
        return find.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.selectProjectById = (pool, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = yield pool
            .request()
            .input("id", id)
            .query(`SELECT * FROM tbProject WHERE ProjectId= @id`);
        return find.recordset[0];
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.selectUsersByIds = (pool, ids) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (ids.length < 1) {
            return [];
        }
        const find = yield pool
            .request()
            .query(`SELECT * FROM tbUser WHERE UserId IN (${ids.map((id) => String(id))})`);
        return find.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.updateSettings = (pool, id, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const setting = yield pool
            .request()
            .input("userId", id)
            .input("token", token)
            .query(`UPDATE tbSettings SET Token = @token WHERE UserId = @userId`);
        return setting.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.updateUserPassword = (pool, id, pass) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const setting = yield pool
            .request()
            .input("userId", id)
            .input("password", pass)
            .query(`UPDATE tbUser SET Password = @password WHERE UserId = @userId`);
        return setting.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.selectUserSettings = (pool, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = yield pool
            .request()
            .input("userId", id)
            .query(`SELECT Token FROM tbSettings WHERE UserId = @userId`);
        return find.recordset[0];
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.selectAllUsers = (pool, discipline, paginationQuery) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const select = `SELECT UserId, FullName, Discipline, JobTitle `;
        const count = `select count(*) as total `;
        const query = `FROM tbUser WHERE Employed = 1 ${discipline ? `and Discipline = '${discipline}' ` : ""}`;
        const pagi = `ORDER BY UserId ${paginationQuery}`;
        const find = yield pool.request().query(select + query + pagi);
        const total = yield pool.request().query(count + query);
        return {
            data: find.recordset,
            count: total.recordset[0],
        };
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.selectSearchUsers = (pool, searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = (0, removeAccents_1.default)(searchTerm).toLowerCase();
        const query = `SELECT UserId, FullName, Discipline, JobTitle
      FROM tbUser`;
        const searchResult = [];
        const find = yield pool.request().query(query);
        console.log("length", find.recordset.length);
        for (let i = 0; i < find.recordset.length; i++) {
            if ((0, removeAccents_1.default)(find.recordset[i]["FullName"])
                .toLowerCase()
                .includes(search)) {
                searchResult.push(find.recordset[i]);
            }
            if (searchResult.length === 10) {
                break;
            }
        }
        return searchResult;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.selectUser = (pool, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `SELECT UserId, FullName, Discipline, JobTitle
      FROM tbUser WHERE UserId = ${userId}`;
        const find = yield pool.request().query(query);
        return find.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.selectAllProjects = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield pool
            .request()
            .query(`SELECT ProjectId, ProjectName FROM tbProject`);
        return projects.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.selectUserProjects = (pool, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield pool.request().query(`SELECT ProjectId, ProjectName, CompletedDate FROM tbProject 
          WHERE ListMember LIKE '%(${id})%' OR ListLeader LIKE '%(${id})%' OR ListManager LIKE '%(${id})%'`);
        return projects.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.selectUserLeaveRequest = (pool, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield pool
            .request()
            .input("toEmail", email)
            .query(`SELECT * FROM tbLeave WHERE ToEmail = @toEmail AND Approved = 0`);
        return projects.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
//OT queries
SqlUtils.selectAllOTRequest = (pool, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otRequest = yield pool
            .request()
            .query(`SELECT * FROM tbOvertimeRequest WHERE ToUserIds LIKE '%(${userId})%' And Approved = 0`);
        return otRequest.recordset;
    }
    catch (error) {
        throw error;
    }
});
SqlUtils.selectOTRequestById = (pool, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otRequest = yield pool
            .request()
            .input("id", id)
            .query(`SELECT * FROM tbOvertimeRequest WHERE Id=@id`);
        return otRequest.recordset[0];
    }
    catch (error) {
        throw error;
    }
});
SqlUtils.selectAllOTActual = (pool, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otRequest = yield pool
            .request()
            .query(`SELECT * FROM tbOvertimeActual WHERE ToUserIds LIKE '%(${userId})%' And Approved = 0`);
        return otRequest.recordset;
    }
    catch (error) {
        throw error;
    }
});
SqlUtils.selectOTActualById = (pool, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otRequest = yield pool
            .request()
            .input("id", id)
            .query(`SELECT * FROM tbOvertimeActual WHERE Id=@id`);
        return otRequest.recordset[0];
    }
    catch (error) {
        throw error;
    }
});
SqlUtils.updateOTRequest = (pool, id, isApproved, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otRequest = yield pool
            .request()
            .input("id", id)
            .input("isApproved", isApproved)
            .query(`UPDATE tbOvertimeRequest SET Approved = @isApproved WHERE Id = @id AND ToUserIds LIKE '%(${userId})%'`);
        return otRequest.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.updateOTActual = (pool, id, isApproved, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otRequest = yield pool
            .request()
            .input("id", id)
            .input("isApproved", isApproved)
            .query(`UPDATE tbOvertimeActual SET Approved = @isApproved WHERE Id = @id AND ToUserIds LIKE '%(${userId})%'`);
        return otRequest.recordset;
    }
    catch (error) {
        throw error;
    }
});
// Leave table
SqlUtils.selectLeaveRequestById = (pool, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otRequest = yield pool
            .request()
            .input("id", id)
            .query(`SELECT * FROM tbLeave WHERE Id=@id`);
        return otRequest.recordset[0];
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
SqlUtils.updateLeaveRequest = (pool, id, isApproved) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otRequest = yield pool
            .request()
            .input("id", id)
            .input("isApproved", isApproved)
            .query(`UPDATE tbLeave SET Approved = @isApproved WHERE Id = @id`);
        return otRequest.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
// Select holidays
SqlUtils.selectAllHolidays = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield pool.request().query(`SELECT * FROM tbHoliday`);
        return projects.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
