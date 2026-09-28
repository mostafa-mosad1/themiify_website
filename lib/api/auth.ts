// lib/api/auth.ts
// Re-export from features/auth for backward compatibility
export type { IUser, ILoginResponse } from "@/features/auth/types";
export { loginUser, logoutUser } from "@/features/auth/functions";
