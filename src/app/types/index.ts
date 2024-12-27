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
    phone: string;
    designation: string;
}

export interface HistoryDTO extends BaseSalaryDetails {
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
