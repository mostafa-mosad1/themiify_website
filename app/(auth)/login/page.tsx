import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "تسجيل الدخول | Themiify",
  description: "تسجيل الدخول إلى لوحة التحكم Themiify",
};

export default function LoginPage() {
  return <LoginClient />;
}
