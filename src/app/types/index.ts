import { Error } from 'mongoose';

export interface BaseSalaryDetails {
    basicSalary: number;
    allowance: number;
    bonus: number;
    overtime: number;
    tax: number;
    holiday: number;
    salaryStatus: "Send" | "Pending";
}

export interface Employee extends BaseSalaryDetails {
    _id: string;
    name: string;
    email: string;
    personalEmail: string;
    phone: string;
    jobStatus: "permanent" | "underReview" | "partTime" | "newJoinee";
    joiningDate: Date;
    leavingDate: Date;
    address: string;
    password: string;
    designation: string;
    profileImage?: string;
    documents?: string[];
}

export interface HistoryDTO extends BaseSalaryDetails {
    _id: string;
    user: string;
    dispatchDate: Date;
}

export interface HistoryDTOWITHOUTID extends BaseSalaryDetails {
    _id?: string;
    user: string;
    dispatchDate: Date;
}

export interface ErrorResponse {
    success: false | true;
    message: string;
    details?: string;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface breakDTO {
    breakStart: Date;
    breakEnd: Date;
}
export interface AttendanceRecord {
    _id: string;
    userId: string;
    userName?: string;
    checkInTime: Date;
    checkOutTime: Date;
    breaks: breakDTO[];
}

export interface AttendanceByDay {
    [key: string]: AttendanceRecord[];
}
export interface AttendanceSummary {
    attendanceByDay: AttendanceByDay;
    totalPresent: number;
    totalAbsents: number;
    overtimeDays: number;
}
export interface SessionUser {
    name: string;
    email: string;
    image?: string;
    accessToken: string;
    id: string;
    role: string;
}

export interface SessionDTO {
    user?: SessionUser;
}
export interface SignUpFormData {
    fullName: string;
    designation: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    name: string;
    personalEmail: string;
}
export interface InvoiceItem {
    ticket: string;
    hours: number;
    price: number;
}
export interface invoiceToDTO {
    invoiceItem: string;
}

export interface billToDTO {
    billToHeading: string;
    billToValue: string;
}
export interface InvoiceData {
    invoiceNumber: string;
    customerName: string;
    items: InvoiceItem[];
    invoiceTo: invoiceToDTO[];
    billTo: billToDTO[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    salesperson: string;
    dateIssued?: Date;
    dateDue?: Date;
    email?: string;
    dateRange?: [Date, Date];
}
export interface MongoError extends Error {
    code?: number;
    keyPattern?: {
        email?: boolean;
        personalEmail?: boolean;
    };
}