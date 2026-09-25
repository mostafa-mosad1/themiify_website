import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "إنشاء حساب جديد | Themiify",
  description: "انضم إلى مجتمع Themiify وأنشئ حسابك الجديد",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
