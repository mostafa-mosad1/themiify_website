/* eslint-disable @typescript-eslint/no-explicit-any */

import { DEFAULT_GUEST, type UserData } from "./types";
export { DEFAULT_GUEST };

let cachedUserState: UserData | null = null;
const listeners = new Set<(state: UserData) => void>();

export function isValidToken(val: string | null | undefined): boolean {
  if (!val) return false;
  const str = String(val).trim();
  return (
    str !== "" &&
    str !== "undefined" &&
    str !== "null" &&
    str !== "[object Object]"
  );
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function parseUserDataFromStorage(): UserData {
  if (typeof window === "undefined") {
    return { ...DEFAULT_GUEST, loading: false };
  }

  try {
    for (const key of [
      "authToken",
      "adminToken",
      "bearer_token",
      "token",
      "access_token",
      "jwt",
      "isAdmin",
      "userRole",
      "userEmail",
      "userData",
      "localAuthSession",
    ]) {
      localStorage.removeItem(key);
    }

    const rawToken =
      getCookie("authToken") ||
      getCookie("bearer_token") ||
      getCookie("adminToken");
    const hasValidToken = isValidToken(rawToken);

    const cached = getCookie("localAuthSession");

    if (cached) {
      let parsed: any = null;
      try {
        parsed = JSON.parse(cached);
      } catch {
        parsed = null;
      }

      if (parsed && typeof parsed === "object") {
        const isSuperAdmin = Boolean(
          parsed.is_super_admin ||
          parsed.isSuperAdmin ||
          parsed.userRole === "super_admin" ||
          parsed.role === "super_admin",
        );
        const isAdmin = Boolean(
          isSuperAdmin ||
          parsed.isAdmin ||
          parsed.is_admin ||
          parsed.role === "admin",
        );
        const userRole = isSuperAdmin
          ? "super_admin"
          : parsed.userRole || parsed.role || (isAdmin ? "admin" : "user");
        const userEmail = (parsed.userEmail || parsed.email || "").trim();
        const userName =
          parsed.userName ||
          parsed.name ||
          (isSuperAdmin
            ? "سوبر أدمن"
            : isAdmin
              ? "أدمن"
              : userEmail
                ? userEmail.split("@")[0]
                : "مستخدم");

        const isLoggedIn = hasValidToken && Boolean(userEmail || hasValidToken);

        if (isLoggedIn) {
          return {
            isAdmin,
            isSuperAdmin,
            userRole,
            isLoggedIn: true,
            userName,
            userEmail,
            userAvatar: parsed.avatar || parsed.userAvatar || "",
            loading: false,
          };
        }
      }
    }

    if (hasValidToken) {
      return {
        ...DEFAULT_GUEST,
        isLoggedIn: true,
        userName: "مستخدم",
      };
    }

    return { ...DEFAULT_GUEST };
  } catch (error) {
    console.error("Error reading user data:", error);
    return { ...DEFAULT_GUEST };
  }
}

export function mutateUserData(): void {
  cachedUserState = parseUserDataFromStorage();
  listeners.forEach((listener) => listener(cachedUserState!));
}

export { cachedUserState, listeners };

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  data?: import("./types").ILoginResponse;
  message?: string;
  error?: string;
}> {
  try {
    const { apiClient } = await import("@/lib/api/config");
    const res = await apiClient<import("./types").ILoginResponse>("/login", {
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
    await fetch("/api/auth/logout", {
      method: "POST",
    }).catch(() => null);

    const cookieNames = [
      "authToken",
      "adminToken",
      "bearer_token",
      "localAuthSession",
    ];
    for (const name of cookieNames) {
      document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
    }

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
