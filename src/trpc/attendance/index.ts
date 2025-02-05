import { protectedProcedure, publicProcedure, router } from "../init";
import {
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getMonthlyAttendance,
  updateAttendance
} from "./controller";
import {
  getMonthlyAttendanceSchema,
  checkInSchema,
  checkOutSchema,
  startBreakSchema,
  endBreakSchema,
  updateAttendanceSchema,
} from '@/app/validations/attendanceSchema';

const attendanceRouter = router({
  checkIn: protectedProcedure
    .input(checkInSchema)
    .mutation(({ input }) => checkIn(input)),

  checkOut: protectedProcedure
    .input(checkOutSchema)
    .mutation(({ input }) => checkOut(input)),

  startBreak: protectedProcedure
    .input(startBreakSchema)
    .mutation(({ input }) => startBreak(input)),

  endBreak: protectedProcedure
    .input(endBreakSchema)
    .mutation(({ input }) => endBreak(input)),

  getMonthlyAttendance: protectedProcedure
    .input(getMonthlyAttendanceSchema)
    .query(({ input }) => getMonthlyAttendance(input.year, input.month)),
  updateAttendance: protectedProcedure
    .input(updateAttendanceSchema)
    .mutation(async ({ input }) => {
      return updateAttendance(input);
    }),
});

export default attendanceRouter;

export type AttendanceRouter = typeof attendanceRouter;
