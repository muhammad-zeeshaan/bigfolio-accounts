"use server";
import User from '@/models/User';
import { SignUpFormData } from '../types';

// interface SignUpFormData {
//     email: string;
//     password: string;
//     designation: string;
//     name: string;
//     phone: string;
// }

interface SignUpResponse {
    success: boolean;
    message: string;
    user?: unknown;
}

interface MongoError extends Error {
    code?: number;
    keyPattern?: {
        email?: boolean;
    };
}

export const signUp = async (formData: SignUpFormData): Promise<SignUpResponse> => {
    const userData = {
        email: formData.email,
        password: formData.password,
        designation: formData.designation,
        name: formData?.name,
        phone: formData.phone,
        basicSalary: 0,
        salaryStatus: "Pending",
    };

    try {
        const user = await User.create(userData);
        return { success: true, user, message: 'User created successfully' };
    } catch (error) {
        const mongoError = error as MongoError;
        if (mongoError.code === 11000 && mongoError.keyPattern?.email) {
            return { success: false, message: 'User already exists with this email.' };
        }
        console.error('Error creating user:', mongoError);
        return { success: false, message: 'User creation failed.' };
    }
};