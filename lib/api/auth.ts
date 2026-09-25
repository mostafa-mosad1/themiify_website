// lib/api/auth.ts
import { apiClient } from "./config";

export interface IUser {
  id: number | string;
  name?: string;
  email: string;
  role?: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
  avatar?: string | null;
}

export interface ILoginResponse {
  token: string;
  user?: IUser;
  admin?: IUser;
}

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  data?: ILoginResponse;
  message?: string;
  error?: string;
}> {
  try {
    const res = await apiClient<ILoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    return res;
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "فشل تسجيل الدخول",
    };
  }
}

export async function logoutUser(redirectToLogin = true): Promise<void> {
  try {
    // 1. Call server logout endpoint to clear all HTTP cookies
    await fetch("/api/auth/logout", {
      method: "POST",
    }).catch(() => null);

    // 2. Clear client-side cookies
    const cookieNames = [
      "authToken",
      "adminToken",
      "bearer_token",
      "localAuthSession",
    ];
    for (const name of cookieNames) {
      document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
    }

    // 3. Clear localStorage
    const localKeys = [
      "isAdmin",
      "userRole",
      "localAuthSession",
      "authToken",
      "bearer_token",
      "userData",
      "userDataTime",
      "userEmail",
    ];
    for (const key of localKeys) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    if (redirectToLogin && typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}
