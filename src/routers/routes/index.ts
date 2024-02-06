import { RouterObject } from "../../types";

import AuthRouter from "./auth";
import HomeRouter from "./home";
import EmployeeRouter from "./employee";
import ProjectRouter from "./project";
import AbsenceRouter from "./absence";
import TaskRouter from "./task";
import TimesheetRouter from "./timesheet";
import OffsetTimeRouter from "./offsettime";
import AccessRightRouter from "./accessright";
import OvertimeTimeRouter from "./overtime";

const routes: RouterObject[] = [
  {
    path: "/api/ot",
    router: new OvertimeTimeRouter().getRouter(),
  },

  {
    path: "/api/accessrights",
    router: new AccessRightRouter().getRouter(),
  },

  {
    path: "/api/offsettime",
    router: new OffsetTimeRouter().getRouter(),
  },

  {
    path: "/api/absence",
    router: new AbsenceRouter().getRouter(),
  },
  {
    path: "/api/timesheet",
    router: new TimesheetRouter().getRouter(),
  },

  {
    path: "/api/task",
    router: new TaskRouter().getRouter(),
  },

  {
    path: "/api/project",
    router: new ProjectRouter().getRouter(),
  },

  {
    path: "/api/employee",
    router: new EmployeeRouter().getRouter(),
  },
  {
    path: "/api/auth",
    router: new AuthRouter().getRouter(),
  },
  {
    path: "/api",
    router: new HomeRouter().getRouter(),
  },
];

export default routes;
