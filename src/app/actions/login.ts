import { getSession, signIn } from "next-auth/react";
import { LoginFormData } from '../types';

interface LoginResponse {
  ok?: boolean;
  error?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    accessToken?: string;
  };
}

const login = async (formData: LoginFormData): Promise<LoginResponse> => {
  try {
    const email = formData.email?.trim() ?? '';
    const password = formData.password?.trim() ?? '';

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!response) {
      return { error: "Authentication service is unavailable" };
    }

    if (!response.ok) {
      if (response.error?.includes("User not found")) {
        return { error: "No account found with this email" };
      } else if (response.error?.includes("Invalid password")) {
        return { error: "Incorrect password" };
      } else {
        return { error: "Login failed. Please check your credentials" };
      }
    }

    const session = await getSession();

    if (!session || !session.user) {
      return { error: "Failed to retrieve user session" };
    }

    return {
      ok: true,
      user: session.user as LoginResponse['user'],
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: errorMessage };
  }
};

export default login;
