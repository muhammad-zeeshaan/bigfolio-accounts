import { z } from "zod";

export const checkInSchema = z.object({
    userId: z.string(),
});

export const checkOutSchema = z.object({
    userId: z.string(),
});

export const startBreakSchema = z.object({
    userId: z.string(),
});

export const endBreakSchema = z.object({
    userId: z.string(),
});

export const getMonthlyAttendanceSchema = z.object({
    year: z.number().min(2000).max(2100),
    month: z.number().min(1).max(12),
});

export const updateAttendanceSchema = z.object({
    _id: z.string().min(1, "Attendance ID is required"),
    userId: z.string().min(1, "User ID is required"),
    checkInTime: z.string().datetime().nullable(),
    checkOutTime: z.string().datetime().nullable(),
    breaks: z
        .array(
            z.object({
                breakStart: z.string().datetime(),
                breakEnd: z.string().datetime(),
            })
        )
        .optional(),
});

export type UpdateAttendanceType = z.infer<typeof updateAttendanceSchema>;
export type CheckInType = z.infer<typeof checkInSchema>;
export type CheckOutType = z.infer<typeof checkOutSchema>;
export type StartBreakType = z.infer<typeof startBreakSchema>;
export type EndBreakType = z.infer<typeof endBreakSchema>;
export type GetMonthlyAttendanceType = z.infer<typeof getMonthlyAttendanceSchema>;