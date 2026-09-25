"use client";
import { useUserData } from "@/lib/hooks/useUserData";
import Link from "next/link";
import { FaHome, FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
   const { isAdmin, isLoggedIn} = useUserData();
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 SVG Animation */}
        <div className="relative mb-8">
          <div className="text-[150px] md:text-[200px] font-bold text-orange-500/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-48 h-48 md:w-64 md:h-64 text-orange-500 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          الصفحة غير موجودة
        </h1>

        <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>

        {/* Search Suggestions */}
        <div className="bg-[var(--bg-tertiary)] rounded-2xl p-6 mb-8 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            روابط مفيدة:
          </h2>
          <ul className="space-y-2 text-right">
            <li>
              <Link
                href="/admin/themes"
                className="text-orange-500 hover:text-orange-600 flex items-center gap-2 justify-end group"
              >
                <span>جميع الثيمات</span>
                <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  href="/admin/themes/create"
                  className="text-orange-500 hover:text-orange-600 flex items-center gap-2 justify-end group"
                >
                <span>إضافة ثيم جديد</span>
                <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              </Link>
            </li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-xl hover:bg-primary/80 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <FaHome />
            <span>الرجوع للرئيسية</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] px-8 py-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-all hover:scale-105"
          >
            <FaArrowLeft />
            <span>العودة للصفحة السابقة</span>
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-[var(--text-tertiary)]">
          إذا كنت تعتقد أن هذه مشكلة، يرجى التواصل مع فريق الدعم
        </p>
      </div>
    </div>
  );
}
