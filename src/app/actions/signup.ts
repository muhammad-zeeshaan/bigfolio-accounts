"use server";
import User from '@/models/User';

export const signUp = async (formData: any): Promise<{ success: boolean, message: string, user?: any }> => {

    const userData = {
        email: formData?.email,
        password: formData?.password,
        designation: formData?.designation,
        name: formData?.name,
        phone: formData?.phone,
        basicSalary: 0,
        salaryStatus: "Pending",
    };

    try {
        const user = await User.create(userData);
        return { success: true, user, message: 'User created successfully' };
    } catch (error: any) {
        if (error.code === 11000 && error.keyPattern?.email) {
            return { success: false, message: 'User already exists with this email.' };
        }
        console.error('Error creating user:', error);
        return { success: false, message: 'User creation failed.' };
    }
};
