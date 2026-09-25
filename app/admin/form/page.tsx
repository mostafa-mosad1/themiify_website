import type { Metadata } from "next";
import AdminFormClient from "./AdminFormClient";

export const metadata: Metadata = {
  title: "إدارة التقييمات | Themiify Admin",
  description: "عرض وإدارة تقييمات وملاحظات المستخدمين في لوحة التحكم",
};

export default function AdminFormPage() {
  return <AdminFormClient />;
}
