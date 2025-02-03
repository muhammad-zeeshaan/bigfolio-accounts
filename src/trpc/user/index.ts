import { addEmployeeSchema, editEmployeeSchema, employeeIdSchema, fetchEmployeesSchema, SendSalarySlipRequestSchema } from '@/app/validations/userSchema';
import { protectedProcedure, router } from "../init";
import {
    fetchEmployees,
    getEmployeeById,
    addEmployee,
    editEmployee,
    deleteEmployee
} from "./controller";
import { SendSalarySlip } from '@/app/actions/sendPDF';

const employeeRouter = router({
    fetchEmployees: protectedProcedure
        .input(fetchEmployeesSchema)
        .query(({ input }) => fetchEmployees(input.page, input.limit)),

    getEmployeeById: protectedProcedure
        .input(employeeIdSchema)
        .query(({ input }) => getEmployeeById(input.id)),

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
        .input(SendSalarySlipRequestSchema).mutation(({ input }) => SendSalarySlip(input))
});

export default employeeRouter;

export type EmployeeRouter = typeof employeeRouter;
