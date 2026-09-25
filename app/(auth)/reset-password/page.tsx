import type { Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "إعادة تعيين كلمة المرور | Themiify",
  description: "إعادة تعيين كلمة المرور لحسابك في Themiify",
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
