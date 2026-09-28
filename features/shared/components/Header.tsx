"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import { usePathname } from "next/navigation";
// import { useUserData } from "@/lib/hooks/useUserData";
import { useUserData } from "@/lib/hooks/useUserData";
import { TiThMenu } from "react-icons/ti";
import Button from "./Button";

// نفس المينيو بالظبط (ممكن تنقله لملف مشترك وتستوردُه)
const menuItems = [
  { label: "الرئيسية", userPath: "/", adminPath: "/admin" },
  { label: "ثيماتنا ", userPath: "/themes", adminPath: "/admin/themes" },
  { label: "المقالات", userPath: "/essays", adminPath: "/admin/essays" },
  {
    label: "إدارة الحسابات",
    userPath: "/admin/accounts",
    adminPath: "/admin/accounts",
  },
  { label: "الاعدادات", userPath: "/settings", adminPath: "/admin/settings" },
  { label: "الدعم", userPath: "/support", adminPath: "/admin/support" },
];

const Header: React.FC = () => {
  const pathname = usePathname();
  const { isAdmin, userName, userRole, isLoggedIn, userAvatar, loading } =
    useUserData();
  const isThemesSection =
    pathname === "/themes" ||
    pathname.startsWith("/themes/") ||
    pathname === "/admin/themes" ||
    pathname.startsWith("/admin/themes/");

  // 🔥 نحدد الصفحة الحالية من المينيو مباشرة
  const currentItem = menuItems.find(
    (item) => pathname === item.userPath || pathname === item.adminPath,
  );

  const headerTitle = currentItem?.label || "لوحة التحكم";

  const toggleSidebar = () => {
    const sidebar = document.querySelector(".resSideBar");
    if (sidebar) {
      sidebar.classList.add("active");
    }
  };

  return (
    <div className="sticky top-0 z-20 mx-auto mb-3 flex w-[calc(100%-0.75rem)] items-center justify-between rounded-full border border-white/80 bg-glass px-3 py-3 shadow-sm backdrop-blur-3xl transition-all duration-300 sm:w-full sm:px-6 md:rounded-full">
      <div className="flex items-center gap-2">
        <TiThMenu
          size={24}
          className="block cursor-pointer text-[var(--text-primary)] md:hidden"
          onClick={toggleSidebar}
        />

        <p className="hidden text-2xl font-bold text-[var(--text-primary)] md:block">
          {headerTitle}
        </p>
        {/* Logo */}
        <Link
          href={isAdmin ? "/admin" : "/"}
          className="flex items-center gap-2 md:hidden"
        >
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <h1 className="text-lg font-bold text-[var(--primary-color)]">
            Themiify
          </h1>
        </Link>
      </div>

      <div className="header-btn hidden items-center gap-2 md:flex md:gap-4">
        {/* Theme Toggle - Top Right */}
        {/* <ThemeToggle /> */}
        <Button className="rounded-full" url="https://themiify.com/">
          العودة للموقع
        </Button>

        {isAdmin && !isThemesSection ? (
          <Button className="rounded-full" url="/themes">
            تصفح الثيمات
          </Button>
        ) : isLoggedIn ? (
          <Button className="rounded-full" url="/admin">
            الدش بورد
          </Button>
        ) : null}

        {!isLoggedIn ? (
          <>
            <span className="text-[var(--text-secondary)] font-medium hidden md:block">
              زائر
            </span>
            <Link href="/login" className="flex items-center gap-2">
              <FaUser
                size={40}
                className="bg-[var(--bg-tertiary)] rounded-full p-2 text-[var(--text-secondary)] transition-colors duration-300"
              />
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href={isAdmin ? "/admin/settings" : "/settings"}
              title="تعديل الملف الشخصي"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="text-right">
                <p className="font-semibold text-[var(--text-primary)] hidden md:block">
                  {userName}
                </p>
                {/* <p className="text-lg text-[var(--text-tertiary)] hidden md:block">{userRole}</p> */}
              </div>

              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary transition-all duration-300 border border-[var(--border-color)]">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-primary font-bold text-lg">
                    {userName?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
