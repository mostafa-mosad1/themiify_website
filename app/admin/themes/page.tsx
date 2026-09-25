import type { Metadata } from "next";
import { Suspense } from "react";
import AdminThemesClient from "./AdminThemesClient";

export const metadata: Metadata = {
  title: "إدارة الثيمات | Themiify Admin",
  description: "عرض وإدارة وتعديل الثيمات في لوحة التحكم",
};

export default function AdminThemesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminThemesClient />
    </Suspense>
  );
}
