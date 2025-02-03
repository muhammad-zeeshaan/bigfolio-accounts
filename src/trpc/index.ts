import attendanceRouter from './attendance';
import { router } from "./init";
import employeeRouter from './user';
// router must be imported before other routers


export const appRouter = router({
  attendance: attendanceRouter,
  employee: employeeRouter
});

export type AppRouter = typeof appRouter;
