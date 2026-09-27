// lib/hooks/useUserData.ts
import { useState, useEffect, useCallback } from "react";

export interface UserData {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userRole: string;
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  userAvatar: string;
  loading: boolean;
}

const DEFAULT_GUEST: UserData = {
  isAdmin: false,
  isSuperAdmin: false,
  userRole: "guest",
  isLoggedIn: false,
  userName: "زائر",
  userEmail: "",
  userAvatar: "",
  loading: false,
};

let cachedUserState: UserData | null = null;
const listeners = new Set<(state: UserData) => void>();

function isValidToken(val: string | null | undefined): boolean {
  if (!val) return false;
  const str = String(val).trim();
  return str !== "" && str !== "undefined" && str !== "null" && str !== "[object Object]";
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]+)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function parseUserDataFromStorage(): UserData {
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
          parsed.role === "super_admin"
        );
        const isAdmin = Boolean(
          isSuperAdmin ||
            parsed.isAdmin ||
            parsed.is_admin ||
            parsed.role === "admin"
        );
        const userRole = isSuperAdmin
          ? "super_admin"
          : (parsed.userRole || parsed.role || (isAdmin ? "admin" : "user"));
        const userEmail = (parsed.userEmail || parsed.email || "").trim();
        const userName =
          parsed.userName ||
          parsed.name ||
          (isSuperAdmin ? "سوبر أدمن" : (isAdmin ? "أدمن" : (userEmail ? userEmail.split("@")[0] : "مستخدم")));

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

/**
 * دالة لتحديث حالة المستخدم لجميع المكونات المشتركة فوراً
 */
export function mutateUserData(): void {
  cachedUserState = parseUserDataFromStorage();
  listeners.forEach((listener) => listener(cachedUserState!));
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData>(() => {
    if (cachedUserState) return cachedUserState;
    return DEFAULT_GUEST;
  });

  const refreshUserData = useCallback(() => {
    mutateUserData();
  }, []);

  useEffect(() => {
    // Initial sync
    if (!cachedUserState) {
      cachedUserState = parseUserDataFromStorage();
    }
    setUserData(cachedUserState);

    const handleChange = (newState: UserData) => {
      setUserData(newState);
    };

    listeners.add(handleChange);

    const handleStorageChange = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key === "userData" ||
        e.key === "authToken" ||
        e.key === "userRole" ||
        e.key === "isAdmin"
      ) {
        mutateUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      listeners.delete(handleChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { ...userData, refreshUserData };
};