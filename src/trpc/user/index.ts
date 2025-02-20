import { addEmployeeSchema, editEmployeeSchema, employeeIdSchema, fetchEmployeesSchema, SendInvoiceSchema, SendSalarySlipRequestSchema, UpdateProfileImageSchema } from '@/app/validations/userSchema';
import { protectedProcedure, router,publicProcedure } from "../init";
import {
    fetchEmployees,
    getEmployeeById,
    addEmployee,
    editEmployee,
    deleteEmployee,
    updateEmployeeProfileImage
} from "./controller";
import { SendInvoice, SendSalarySlip } from '@/app/actions/sendPDF';

const employeeRouter = router({
    fetchEmployees: publicProcedure
        .input(fetchEmployeesSchema)
        .query(({ input }) => fetchEmployees(input.page, input.limit)),

    getEmployeeById: protectedProcedure
        .input(employeeIdSchema)
        .mutation(({ input }) => getEmployeeById(input.id)),

    addEmployee: protectedProcedure
        .input(addEmployeeSchema)
        .mutation(({ input }) => addEmployee(input)),

    editEmployee: protectedProcedure
        .input(editEmployeeSchema)
        .mutation(({ input }) => editEmployee(input)),

    deleteEmployee: protectedProcedure
        .input(employeeIdSchema)
        .mutation(({ input }) => deleteEmployee(input.id)),
    sendSalarySlip: protectedProcedure
        .input(SendSalarySlipRequestSchema).mutation(({ input }) => SendSalarySlip(input)),
    sendInvoice: protectedProcedure
        .input(SendInvoiceSchema).mutation(({ input }) => SendInvoice(input)),
    updateEmployeeProfileImage: protectedProcedure
        .input(UpdateProfileImageSchema)
        .mutation(({ input }) => updateEmployeeProfileImage(input.employeeId, input.profileImage)),
});

export default employeeRouter;

export type EmployeeRouter = typeof employeeRouter;
