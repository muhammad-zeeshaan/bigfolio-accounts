import { AddDocumentSchema, addEmployeeSchema, DeleteDocumentSchema, editEmployeeSchema, emailSchema, employeeIdSchema, fetchEmployeesSchema, SendInvoiceSchema, SendSalarySlipRequestSchema, UpdateDocumentsSchema, UpdateProfileImageSchema } from '@/app/validations/userSchema';
import { protectedProcedure, router,publicProcedure } from "../init";
import {
    fetchEmployees,
    getEmployeeById,
    addEmployee,
    editEmployee,
    deleteEmployee,
    updateEmployeeProfileImage,
    updateEmployeeDocuments,
    addEmployeeDocument,
    deleteEmployeeDocument
} from "./controller";
import { generatePDFinvoice, SendInvoice, sendInvoiceEmail, SendSalarySlip } from '@/app/actions/sendPDF';
import { z } from 'zod';

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
    updateEmployeeDocuments: protectedProcedure
        .input(UpdateDocumentsSchema)
        .mutation(({ input }) => updateEmployeeDocuments(input.employeeId, input.documents)),
    addEmployeeDocument: protectedProcedure
        .input(AddDocumentSchema)
        .mutation(({ input }) => addEmployeeDocument(input.employeeId, input.document)),
    deleteEmployeeDocument: protectedProcedure
        .input(DeleteDocumentSchema)
        .mutation(({ input }) => deleteEmployeeDocument(input.employeeId, input.document)),
    sendInvoiceEmail: publicProcedure
        .input(emailSchema)
        .mutation(async ({ input }) => {
            return sendInvoiceEmail(input.emails, input.pdfBase64, input.ccEmails);
        }),
    generatePDFinvoice: protectedProcedure
        .input(z.any())
        .mutation(({ input }) => generatePDFinvoice(input)),
});

export default employeeRouter;

export type EmployeeRouter = typeof employeeRouter;
