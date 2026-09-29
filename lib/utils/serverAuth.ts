// lib/utils/serverAuth.ts
import { cookies } from "next/headers";

export interface ServerUser {
  id: string;
  email: string;
  isAdmin: boolean;
  userRole: string;
  isSuperAdmin: boolean;
}

export async function getCurrentServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("localAuthSession")?.value;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sessionCookie));
        if (parsed && (parsed.email || parsed.userEmail)) {
          const role = String(parsed.userRole || parsed.role || "").toLowerCase();
          const isSuper = Boolean(
            parsed.is_super_admin === true ||
            parsed.isSuperAdmin === true ||
            role === "super_admin"
          );
          const isAdmin = Boolean(
            isSuper ||
            parsed.isAdmin === true ||
            parsed.is_admin === true ||
            role === "admin"
          );
          return {
            id: String(parsed.id || "1"),
            email: parsed.email || parsed.userEmail || "",
            isAdmin,
            userRole: isSuper ? "super_admin" : isAdmin ? "admin" : "user",
            isSuperAdmin: isSuper,
          };
        }
      } catch {}
    }

    const adminToken = cookieStore.get("adminToken")?.value;
    if (adminToken && adminToken !== "undefined" && adminToken !== "null") {
      return {
        id: "1",
        email: "admin@themiify.com",
        isAdmin: true,
        userRole: "admin",
        isSuperAdmin: false,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting current server user:", error);
    return null;
  }
}

export async function requireAdmin(): Promise<ServerUser | null> {
  const user = await getCurrentServerUser();
  if (!user || !user.isAdmin) {
    return null;
  }
  return user;
}

export async function requireSuperAdmin(): Promise<ServerUser | null> {
  const user = await getCurrentServerUser();
  if (!user || !user.isSuperAdmin) {
    return null;
  }
  return user;
}
