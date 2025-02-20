"use server";

import { Error } from 'mongoose';
import { Employee, ErrorResponse, MongoError } from '../types';
import User from '@/models/User';

export async function fetchEmployees(page: number, limit: number): Promise<{ data: Employee[]; currentPage: number; limit: number; totalRecords: number }> {
    try {
        const totalRecords = await User.countDocuments({ role: { $ne: 'admin' } });
        const users = await User.find({ role: { $ne: 'admin' } })
            .select("-profileImage -documents")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean<Employee[]>();

        const data = users.map(user => ({
            ...user,
            _id: user._id.toString(),
        }));

        return {
            data,
            currentPage: page,
            limit,
            totalRecords,
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        return {
            data: [],
            currentPage: page,
            limit,
            totalRecords: 0,
        };
    }
}

export async function getEmployeeById(id: string): Promise<Employee | ErrorResponse> {
    try {
        const employee = await User.findById(id).lean<Employee>();
        if (employee) {
            return {
                ...employee,
                _id: employee._id.toString(),
            };
        }
        return {
            success: false,
            message: `Employee with id ${id} not found`,
        };
    } catch (error) {
        console.error("Error fetching employee by id:", error);
        return {
            success: false,
            message: "Error fetching employee by id",
            details: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function addEmployee(newEmployee: Omit<Employee, '_id'>): Promise<Employee | ErrorResponse> {
    try {
        const createdEmployee = await User.create(newEmployee);
        ;
        return {
            ...createdEmployee,
            _id: createdEmployee._id.toString(),
        };
    } catch (error) {
        console.error("Error adding employee:", error);
        const mongoError = error as MongoError;
        if (mongoError.code === 11000 && mongoError.keyPattern?.email) {
            return { success: false, message: 'User already exists with this email.' };
        }
        return {
            success: false,
            message: "Error adding employee",
            details: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function editEmployee(updatedEmployee: Employee): Promise<Employee | ErrorResponse> {
    try {
        const updatedUser = await User.findByIdAndUpdate(updatedEmployee._id, updatedEmployee, {
            new: true,
        }).lean<Employee>();

        if (!updatedUser) {
            console.error("Employee not found for update");
            return {
                success: false,
                message: "Employee not found for update",
            };
        }

        return {
            ...updatedUser,
            _id: updatedUser._id.toString(),
        };;
    } catch (error) {
        console.error("Error editing employee:", error);
        return {
            success: false,
            message: "Error editing employee",
            details: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function deleteEmployee(employeeId: string): Promise<Employee | ErrorResponse> {
    try {
        const result = await User.findByIdAndDelete(employeeId).lean<Employee>();
        if (!result) {
            return {
                success: false,
                message: "Employee not found for deletion",
            };
        }
        return {
            ...result,
            _id: result._id.toString(),
        };
    } catch (error) {
        console.error("Error deleting employee:", error);
        return {
            success: false,
            message: "Error deleting employee",
            details: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

