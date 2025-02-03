import { z } from 'zod';

export const fetchEmployeesSchema = z.object({
    page: z.number().min(1, "Page must be at least 1"),
    limit: z.number().min(1, "Limit must be at least 1"),
});

const dateSchema = z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val === null ? null : val),
    z.date().nullable().optional()
);

export const addEmployeeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    personalEmail: z.string().email("Invalid personal email address").min(1, "Personal email is required"),
    phone: z.string().optional(),
    jobStatus: z.enum(["permanent", "underReview", "partTime", "newJoinee"]).optional(),
    joiningDate: dateSchema,
    leavingDate: dateSchema,
    address: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    salaryStatus: z.enum(["Send", "Pending"]).optional(),
    basicSalary: z.number().min(0, "Basic salary must be a positive number").optional(),
    allowance: z.number().min(0, "Allowance must be a positive number").default(0),
    bonus: z.number().min(0, "Bonus must be a positive number").default(0),
    overtime: z.number().min(0, "Overtime must be a positive number").default(0),
    tax: z.number().min(0, "Tax must be a positive number").default(0),
    holiday: z.number().min(0, "Holiday must be a positive number").default(0),
    designation: z.string().optional(),
});

export const editEmployeeSchema = z.object({
    _id: z.string().min(1, "Employee ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    personalEmail: z.string().email("Invalid personal email address").min(1, "Personal email is required"),
    phone: z.string().optional(),
    jobStatus: z.enum(["permanent", "underReview", "partTime", "newJoinee"]).optional(),
    joiningDate: dateSchema,
    leavingDate: dateSchema,
    address: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    salaryStatus: z.enum(["Send", "Pending"]).optional(),
    basicSalary: z.number().min(0, "Basic salary must be a positive number").optional(),
    allowance: z.number().min(0, "Allowance must be a positive number").default(0),
    bonus: z.number().min(0, "Bonus must be a positive number").default(0),
    overtime: z.number().min(0, "Overtime must be a positive number").default(0),
    tax: z.number().min(0, "Tax must be a positive number").default(0),
    holiday: z.number().min(0, "Holiday must be a positive number").default(0),
    designation: z.string().optional(),
});

export const employeeIdSchema = z.object({
    id: z.string().min(1, "Employee ID is required"),
});
export const SendSalarySlipRequestSchema = z.object({
    employeeIds: z.array(z.unknown()),
});

export type addEmployeeType = z.infer<typeof addEmployeeSchema>;
export type editEmployeeType = z.infer<typeof editEmployeeSchema>;
export type fetchEmployeesType = z.infer<typeof fetchEmployeesSchema>;
export type employeeIdType = z.infer<typeof employeeIdSchema>;
export type SendSalarySlipRequest = z.infer<typeof SendSalarySlipRequestSchema>;
