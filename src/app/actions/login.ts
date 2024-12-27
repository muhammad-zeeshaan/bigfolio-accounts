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

const login = async (
  formData: LoginFormData,
): Promise<LoginResponse> => {
  try {
    const email = formData.email ?? '';
    const password = formData.password ?? '';

    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!response?.ok) {
      return {
        error: "Wrong credentials",
      };
    }

    const session = await getSession();

    if (!session?.user) {
      return {
        error: "Unable to retrieve user session",
      };
    }

    return {
      ok: response.ok,
      user: session.user as any,
    };
  } catch (err: any) {
    return {
      error: err.message || "An unexpected error occurred.",
    };
  }
};

export default login;
