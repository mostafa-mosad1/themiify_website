import Header from "@/components/shared/Header";
import SideBar from "@/components/shared/SideBar";
import Link from "next/link";
import { FaMobileAlt, FaUser } from "react-icons/fa";
import { redirect } from "next/navigation";
import { getCurrentServerUser } from "@/lib/utils/serverAuth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is admin
  const currentUser = await getCurrentServerUser();


  return (
    <div className="bg-glass rounded-3xl">
      {/* رسالة للأجهزة المحمولة */}
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 text-center md:hidden">
        <FaMobileAlt className="text-8xl text-primary mb-6 animate-bounce " />
        <h2 className="text-3xl font-bold mb-4">
          عذراً، لوحة التحكم غير متاحة على الهاتف
        </h2>
        <p className="text-lg text-gray-600 max-w-md">
          لوحة التحكم مصممة للعمل على أجهزة الكمبيوتر والتابلت فقط. يرجى استخدام
          جهاز كمبيوتر أو تابلت للدخول.
        </p>
        <div className="mt-8 w-16 h-1 bg-primary/30 rounded-full"></div>
        <p className="mt-6 text-sm text-gray-400">Themiify Admin Panel</p>
      </div>

      {/* المحتوى الأساسي - مخفي على الموبايل */}
      <div className="hidden md:block">
        <div className="flex justify-center gap-3 border rounded-2xl mx-auto p-5 ">
          <SideBar />
          <div className="flex-1 min-w-0 h-fit flex flex-col">
            <Header />
            <div className="flex-1 ">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
