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
    success: false;
    message: string;
    details?: string;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface AttendanceRecord {
    userId: string;
    userName?: string;
    checkInTime: Date;
    checkOutTime: Date;
    breaks: {
        breakStart: Date;
        breakEnd: Date;
    }[];
}

export interface AttendanceByDay {
    [key: string]: AttendanceRecord[];
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
}