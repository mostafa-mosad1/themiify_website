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
    const token =
      cookieStore.get("authToken")?.value ||
      cookieStore.get("adminToken")?.value ||
      cookieStore.get("bearer_token")?.value;

    const sessionCookie = cookieStore.get("localAuthSession")?.value;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sessionCookie));
        if (parsed && (parsed.email || parsed.userEmail)) {
          const isSuper = Boolean(
            parsed.is_super_admin ??
            parsed.isSuperAdmin ??
            (parsed.userRole === "super_admin" || parsed.role === "super_admin")
          );
          return {
            id: String(parsed.id || "1"),
            email: parsed.email || parsed.userEmail || "",
            isAdmin: Boolean(parsed.isAdmin ?? true),
            userRole: isSuper ? "super_admin" : (parsed.userRole || (parsed.isAdmin ? "admin" : "user")),
            isSuperAdmin: isSuper,
          };
        }
      } catch {}
    }

    if (token) {
      return {
        id: "1",
        email: "admin@themiify.com",
        isAdmin: true,
        userRole: "admin",
        isSuperAdmin: true,
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
