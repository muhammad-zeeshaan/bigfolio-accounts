"use server";
import fs from 'fs';
import { TRPCError } from "@trpc/server";
import { Employee } from "@/app/types";
import { addEmployeeType, editEmployeeType } from "@/app/validations/userSchema";
import User from "@/models/User";
import Attendance from '@/models/Attendance';
import path from 'path';

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

export const updateEmployeeProfileImage = async (
  employeeId: string,
  profileImageBase64: string
): Promise<{ success: boolean; imageUrl: string; message: string }> => {
  try {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const base64Data = profileImageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const fileName = `profile_${employeeId}_${Date.now()}.png`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/public/uploads/${fileName}`;

    const updatedUser = await User.findByIdAndUpdate(
      employeeId,
      { profileImage: imageUrl },
      { new: true }
    ).lean();

    if (!updatedUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found for profile image update",
      });
    }

    return { success: true, imageUrl, message: "Profile image updated successfully" };
  } catch (error) {
    console.error("Error updating profile image:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error updating profile image",
      cause: error,
    });
  }
};

export const updateEmployeeDocuments = async (
  employeeId: string,
  documents: string[]
): Promise<{ success: boolean; message: string; documentUrls: string[] }> => {
  try {
    const uploadDir = path.join(process.cwd(), "public/documents");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const user = await User.findById(employeeId).lean();
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found for document update",
      });
    }

    const newDocumentUrls: string[] = [];

    for (const doc of documents) {
      if (doc.startsWith("data:image")) {
        const base64Data = doc.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        const fileName = `doc_${employeeId}_${Date.now()}.png`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, buffer);

        newDocumentUrls.push(`/public/documents/${fileName}`);
      } else {
        newDocumentUrls.push(doc);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      employeeId,
      { documents: newDocumentUrls },
      { new: true }
    ).lean();

    if (!updatedUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found for document update",
      });
    }

    return { success: true, message: "Documents updated successfully", documentUrls: newDocumentUrls };
  } catch (error) {
    console.error("Error updating documents:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error updating documents",
      cause: error,
    });
  }
};

export const addEmployeeDocument = async (
  employeeId: string,
  document: string
): Promise<{ success: boolean; message: string; documentUrl: string }> => {
  try {
    const uploadDir = path.join(process.cwd(), "public/documents");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let documentUrl = document;

    if (document.startsWith("data:image")) {
      const base64Data = document.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const fileName = `doc_${employeeId}_${Date.now()}.png`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);

      documentUrl = `/public/documents/${fileName}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      employeeId,
      { $push: { documents: documentUrl } }, // Push new document URL
      { new: true }
    ).lean();

    if (!updatedUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found for document addition",
      });
    }

    return { success: true, message: "Document added successfully", documentUrl };
  } catch (error) {
    console.error("Error adding document:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error adding document",
      cause: error,
    });
  }
};


export async function deleteEmployeeDocument(employeeId: string, document: string): Promise<{ success: boolean; message: string }> {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      employeeId,
      { $pull: { documents: document } }, // Remove document
      { new: true }
    ).lean();
    await Attendance.deleteMany({ userId: employeeId })
    if (!updatedUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found for document deletion",
      });
    }

    return { success: true, message: "Document deleted successfully" };
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error deleting document",
      cause: error,
    });
  }
}
