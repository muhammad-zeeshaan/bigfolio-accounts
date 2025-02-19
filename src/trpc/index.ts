import attendanceRouter from './attendance';
import { dashboardRouter } from './dashboard';
import { router } from "./init";
import employeeRouter from './user';
// router must be imported before other routers


export const appRouter = router({
  attendance: attendanceRouter,
  employee: employeeRouter,
  dashboard: dashboardRouter
});

export type AppRouter = typeof appRouter;
