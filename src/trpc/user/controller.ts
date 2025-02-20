"use server";

import { TRPCError } from "@trpc/server";
import { Employee } from "@/app/types";
import { addEmployeeType, editEmployeeType } from "@/app/validations/userSchema";
import User from "@/models/User";

export async function fetchEmployees(
  page: number,
  limit: number
): Promise<{ data: Employee[]; currentPage: number; limit: number; totalRecords: number }> {
  try {
    const totalRecords = await User.countDocuments({ role: { $ne: "admin" } });
    const users = await User.find({ role: { $ne: "admin" } })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<Employee[]>();

    return {
      data: users.map((user) => ({ ...user, _id: user._id.toString() })),
      currentPage: page,
      limit,
      totalRecords,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error fetching employees",
      cause: error,
    });
  }
}

export async function getEmployeeById(id: string): Promise<Employee> {
  try {
    const employee = await User.findById(id).lean<Employee>();

    if (!employee) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Employee with ID ${id} not found`,
      });
    }

    return { ...employee, _id: employee._id.toString() };
  } catch (error) {
    console.error("Error fetching employee by ID:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error fetching employee",
      cause: error,
    });
  }
}

export async function addEmployee(newEmployee: addEmployeeType): Promise<Employee> {
  try {
    const createdEmployee = await User.create(newEmployee);
    return { ...createdEmployee.toObject(), _id: createdEmployee._id.toString() };
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code: number }).code === 11000) {
      throw new TRPCError({ code: "CONFLICT", message: "User already exists with this email." });
    }
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error adding employee" });
  }
}

export async function editEmployee(updatedEmployee: editEmployeeType): Promise<Employee> {
  try {
    const updatedUser = await User.findByIdAndUpdate(updatedEmployee._id, updatedEmployee, {
      new: true,
    }).select("-profileImage -documents").lean<Employee>();

    if (!updatedUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found for update",
      });
    }

    return { ...updatedUser, _id: updatedUser._id.toString() };
  } catch (error) {
    console.error("Error editing employee:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error editing employee",
      cause: error,
    });
  }
}

export async function deleteEmployee(employeeId: string): Promise<Employee> {
  try {
    const result = await User.findByIdAndDelete(employeeId).select("-profileImage -documents").lean<Employee>();

    if (!result) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found for deletion",
      });
    }

    return { ...result, _id: result._id.toString() };
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error deleting employee",
      cause: error,
    });
  }
}

export async function updateEmployeeProfileImage(employeeId: string, profileImage: string): Promise<{ success: boolean; message: string }> {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      employeeId,
      { profileImage },
      { new: true }
    ).lean<Employee>();

    if (!updatedUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found for profile image update",
      });
    }

    return { success: true, message: "Profile image updated successfully" };
  } catch (error) {
    console.error("Error updating profile image:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error updating profile image",
      cause: error,
    });
  }
}

export async function updateEmployeeDocuments(employeeId: string, documents: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      employeeId,
      { documents },
      { new: true }
    ).lean<Employee>();

    if (!updatedUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found for documents update",
      });
    }

    return { success: true, message: "documents updated successfully" };
  } catch (error) {
    console.error("Error updating documents:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error updating documents",
      cause: error,
    });
  }
}
