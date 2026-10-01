// lib/api/auth.ts
// Re-export from features/auth for backward compatibility
export type {
  IUser,
  ILoginResponse,
  IRegisterResponse,
} from "@/features/auth/types";
export { loginUser, registerUser, logoutUser } from "@/features/auth/functions";
