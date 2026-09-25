import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "نسيت كلمة المرور | Themiify",
  description: "استعادة كلمة المرور لحسابك في Themiify",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
