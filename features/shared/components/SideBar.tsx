"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Icons
import { AiFillHome } from "react-icons/ai";
import {
  FaFileSignature,
  FaWpforms,
  FaSignInAlt,
  FaChevronDown,
  FaGlobe,
} from "react-icons/fa";
import { IoClose, IoSettings } from "react-icons/io5";
import { IoIosColorPalette } from "react-icons/io";
import { TbLogout } from "react-icons/tb";
import { MdOutlineSupportAgent } from "react-icons/md";
import { MdCategory, MdAdminPanelSettings } from "react-icons/md";
import { HiMiniMinusSmall } from "react-icons/hi2";

// Lib
import { useCache, CACHE_DURATION } from "@/lib/hooks/useCache";
import { useUserData } from "@/lib/hooks/useUserData";
import { fetchClientPlatforms } from "@/lib/api/platforms";
import { logoutUser } from "@/lib/api/auth";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  userPath: string;
  adminPath: string;
  showForUser?: boolean;
  showForGuest?: boolean;
  superAdminOnly?: boolean;
}

interface Platform {
  id: string;
  name: string;
}
 
// ─── Menu Config ─────────────────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  {
    id: "home",
    label: "الرئيسية",
    icon: <AiFillHome size={20} />,
    userPath: "/",
    adminPath: "/admin",
    showForUser: true,
    showForGuest: true,
  },
  {
    id: "platforms",
    label: "المنصات",
    icon: <FaGlobe size={20} />,
    userPath: "/themes",
    adminPath: "/admin/platforms",
    showForUser: false,
    showForGuest: false,
  },
  {
    id: "categories",
    label: "الاقسام",
    icon: <MdCategory size={20} />,
    userPath: "/themes",
    adminPath: "/admin/categories",
    showForUser: false,
    showForGuest: false,
  },
  {
    id: "theme",
    label: "الثيمات",
    icon: <IoIosColorPalette size={20} />,
    userPath: "/themes",
    adminPath: "/admin/themes",
    showForUser: true,
    showForGuest: true,
  },
  {
    id: "blogs",
    label: "المقالات",
    icon: <FaFileSignature size={20} />,
    userPath: "/essays",
    adminPath: "/admin/essays",
    showForUser: true,
    showForGuest: true,
  },
  {
    id: "supportPage",
    label: "الدعم",
    icon: <MdOutlineSupportAgent size={25} />,
    userPath: "/support",
    adminPath: "/admin/support",
    showForUser: true,
    showForGuest: true,
  },
  {
    id: "form",
    label: "فورم",
    icon: <FaWpforms size={20} />,
    userPath: "/form",
    adminPath: "/admin/form",
    showForUser: false,
    showForGuest: false,
  },
  {
    id: "accounts",
    label: "إدارة الحسابات",
    icon: <MdAdminPanelSettings size={22} />,
    userPath: "/admin/accounts",
    adminPath: "/admin/accounts",
    showForUser: false,
    showForGuest: false,
    superAdminOnly: true,
  },
  // {
  //   id: "settings",
  //   label: "الاعدادات",
  //   icon: <IoSettings size={20} />,
  //   userPath: "/settings",
  //   adminPath: "/admin/settings",
  //   showForUser: false,
  //   showForGuest: false,
  // },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MOBILE_BREAKPOINT = 1024; // px — matches Tailwind's `lg`

const isMobileScreen = (): boolean =>
  typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

const SidebarSkeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div
    className={`bg-glass p-4 rounded-3xl flex flex-col animate-pulse ${className}`}
  >
    <div className="flex items-center gap-3 mb-8 justify-center">
      <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg" />
      <div className="w-24 h-8 bg-[var(--bg-tertiary)] rounded" />
    </div>
    <ul className="flex-1 space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="mb-5 flex justify-center">
          <div className="w-[90%] h-12 bg-[var(--bg-tertiary)] rounded-xl" />
        </li>
      ))}
    </ul>
  </div>
);

// ─── Platform Sub-menu Item ───────────────────────────────────────────────────

interface PlatformItemProps {
  platform: Platform;
  basePath: string;
  isParentActive: boolean;
  activePlatform: string | null;
  onNavigate: (path: string) => void;
}

const PlatformItem: React.FC<PlatformItemProps> = ({
  platform,
  basePath,
  isParentActive,
  activePlatform,
  onNavigate,
}) => {
  const platformUrl = `${basePath}?platform=${encodeURIComponent(platform.name)}`;
  const isActive = isParentActive && activePlatform === platform.name;

  return (
    <li>
      <a
        href={platformUrl}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isActive) {
            return;
          }
          onNavigate(platformUrl);
        }}
        className="flex items-center cursor-pointer"
      >
        <HiMiniMinusSmall
          size={16}
          className={` shrink-0 ${
            isActive
              ? "text-[var(--primary-color)] font-bold text-base"
              : "text-black dark:text-white hover:text-[var(--primary-color)]"
          }`}
        />
        <span
          className={`text-sm transition-all block w-full hover:-translate-x-1 ${
            isActive
              ? "text-[var(--primary-color)] font-bold text-base"
              : "text-black dark:text-white hover:text-[var(--primary-color)]"
          }`}
        >
          {platform.name}
        </span>
      </a>
    </li>
  );
};

// ─── Theme Menu Item (with dropdown) ─────────────────────────────────────────

interface ThemeMenuItemProps {
  item: MenuItem;
  fullPath: string;
  isActive: boolean;
  isExpanded: boolean;
  platforms: Platform[];
  activePlatform: string | null;
  onToggleExpand: () => void;
  onNavigate: (path: string) => void;
  onPlatformNavigate: (path: string) => void;
}

const ThemeMenuItem: React.FC<ThemeMenuItemProps> = ({
  item,
  fullPath,
  isActive,
  isExpanded,
  platforms,
  activePlatform,
  onToggleExpand,
  onNavigate,
  onPlatformNavigate,
}) => (
  <div className="relative rounded-3xl w-[90%] mx-auto flex flex-col justify-center overflow-hidden items-center md:text-lg ">
    {/* Main row: theme Link label + chevron button */}
    <div
      className={`flex w-full relative z-10 flex-1 rounded-full font-medium items-center justify-between select-none transition-all duration-300 ${
        isActive
          ? "text-white gradient-secondary bg-[var(--secondary-color)] rounded-e-none rounded-s-none"
          : "text-content-primary !shadow-[inset_2px_4px_10px_rgb(14_19_44_/_10%),inset_-2px_-4px_10px_rgb(255_255_255_/_20%)]"
      }`}
    >
      {/* Clickable label — navigates via router.push without hover prefetch spam */}
      <a
        href={fullPath}
        onClick={(e) => {
          e.preventDefault();
          if (!isExpanded) {
            onToggleExpand();
          }
          if (isActive) {
            return;
          }
          onNavigate(fullPath);
        }}
        className={`flex-1 py-4 md:py-3 pr-8 pl-2 rounded-full font-medium inline-flex items-center gap-2 cursor-pointer ${
          isActive
            ? "w-[95%] !shadow-none text-white"
            : "w-full !text-black dark:!text-white"
        }`}
      >
        <span>{item.icon}</span>
        <span>{item.label}</span>
      </a>

      {/* Chevron — toggles dropdown only */}
      <button
        type="button"
        aria-label="Toggle platforms menu"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggleExpand();
        }}
        className={`px-4 py-4 md:py-3 rounded-full transition-all duration-300 cursor-pointer ${
          isActive ? "text-white" : "text-content-primary"
        }`}
      >
        <FaChevronDown
          size={14}
          className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>
    </div>

    {/* Platforms dropdown */}
    {platforms.length > 0 && (
      <div
        className={`w-full mx-auto transition-all duration-300 overflow-hidden rounded-bl-3xl rounded-br-3xl ${
          isExpanded ? "max-h-96 opacity-100 mb-2" : "max-h-0 opacity-0 m-0"
        }`}
      >
        <ul
          className="flex flex-col gap-3 pr-4 py-2 !shadow-[inset_2px_4px_10px_rgb(14_19_44_/_10%),inset_-2px_-4px_10px_rgb(255_255_255_/_20%)]"
          role="listbox"
          aria-label="Platforms"
        >
          {/* All themes */}
          <li>
            <a
              href={fullPath}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isActive && !activePlatform) {
                  return;
                }
                onPlatformNavigate(fullPath);
              }}
              className="flex items-center cursor-pointer"
            >
              <HiMiniMinusSmall
                size={16}
                className={` shrink-0 ${
                  isActive && !activePlatform
                    ? "text-[var(--primary-color)] font-bold text-base"
                    : "text-black hover:text-[var(--primary-color)]"
                }`}
              />
              <span
                className={`text-sm transition-all block w-full hover:-translate-x-1 ${
                  isActive && !activePlatform
                    ? "text-[var(--primary-color)] font-bold text-base"
                    : "text-black hover:text-[var(--primary-color)]"
                }`}
              >
                كل الثيمات
              </span>
            </a>
          </li>

          {platforms.map((platform) => (
            <PlatformItem
              key={platform.id}
              platform={platform}
              basePath={fullPath}
              isParentActive={isActive}
              activePlatform={activePlatform}
              onNavigate={onPlatformNavigate}
            />
          ))}
        </ul>
      </div>
    )}
  </div>
);

// ─── Regular Menu Item ────────────────────────────────────────────────────────

interface RegularMenuItemProps {
  item: MenuItem;
  fullPath: string;
  isActive: boolean;
  onNavigate: (path: string) => void;
}

const RegularMenuItem: React.FC<RegularMenuItemProps> = ({
  item,
  fullPath,
  isActive,
  onNavigate,
}) => (
  <div className="relative rounded-3xl w-[90%] mx-auto flex flex-col justify-center overflow-hidden items-center">
    <a
      href={fullPath}
      onClick={(e) => {
        e.preventDefault();
        if (isActive) {
          return;
        }
        onNavigate(fullPath);
      }}
      className={`relative z-10 overflow-hidden px-8 py-3 rounded-full font-medium inline-flex items-center gap-2 cursor-pointer select-none transition-all duration-300 ${
        isActive
          ? "text-white gradient-secondary bg-[var(--secondary-color)] w-[95%]"
          : "w-full !text-black dark:!text-white !shadow-[inset_2px_4px_10px_rgb(14_19_44_/_10%),inset_-2px_-4px_10px_rgb(255_255_255_/_20%)]"
      }`}
    >
      <div className="flex items-center gap-2 relative z-10 md:text-lg ">
        <span>{item.icon}</span>
        <span>{item.label}</span>
      </div>
    </a>
  </div>
);

// ─── Main Sidebar Content ─────────────────────────────────────────────────────

const SideBarContent: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isAdminSection = pathname.startsWith("/admin");

  const isOnThemesPage = pathname === "/themes" || pathname === "/admin/themes";
  const isThemesSection =
    pathname === "/themes" ||
    pathname.startsWith("/themes/") ||
    pathname === "/admin/themes" ||
    pathname.startsWith("/admin/themes/");

  const [expandedMenu, setExpandedMenu] = useState<string | null>(() =>
    isOnThemesPage ? "theme" : null,
  );

  const { isAdmin, isSuperAdmin, userRole, isLoggedIn, loading } =
    useUserData();
  const hasAdminAccess =
    isAdmin ||
    isSuperAdmin ||
    userRole === "admin" ||
    userRole === "super_admin";

  // Listen for localStorage changes to update user data
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userData" || e.key === "isAdmin" || e.key === "userRole") {
        // Force refresh when user data changes
        window.location.reload();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const { data: rawPlatforms } = useCache<Platform[]>(
    "platforms",
    async () => {
      const res = await fetchClientPlatforms();
      return (res.platforms || []).map((p) => ({
        id: String(p.id),
        name: p.name,
      }));
    },
    { duration: CACHE_DURATION.PLATFORMS },
  );

  const platforms = rawPlatforms ?? [];

  // ── Sidebar open/close ──────────────────────────────────────────────────────

  const closeSidebar = useCallback(() => {
    const sidebar = document.querySelector(".resSideBar");
    sidebar?.classList.remove("active");
  }, []);

  /** Close sidebar only on mobile screens */
  const closeSidebarOnMobile = useCallback(() => {
    if (isMobileScreen()) {
      closeSidebar();
    }
  }, [closeSidebar]);

  // ── Auth ────────────────────────────────────────────────────────────────────

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logoutUser(true);
  };

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleNavigation = useCallback(
    (path: string) => {
      router.push(path);
      closeSidebarOnMobile();
    },
    [router, closeSidebarOnMobile],
  );

  // ── Filtered menu items ─────────────────────────────────────────────────────

  const visibleMenuItems = MENU_ITEMS.filter((item) => {
    if (isAdminSection) {
      if (item.superAdminOnly) {
        return isSuperAdmin;
      }
      return hasAdminAccess ? true : item.showForUser === true;
    }
    // Client section
    if (item.superAdminOnly) return false;
    if (isLoggedIn) {
      return item.showForUser === true;
    }
    return item.showForGuest === true;
  });

  const activePlatform = searchParams?.get("platform") ?? null;

  // ── Render loading skeleton ─────────────────────────────────────────────────

  if (loading) {
    return (
      <SidebarSkeleton className="lg:w-[20%] xl:w-[15%] lg:min-w-[250px] w-full h-[90vh] shadow-sm" />
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <aside
      className="w-full h-full fixed top-0 right-0 z-50 flex flex-col rounded-2xl shadow-sm resSideBar !border-none lg:w-[20%] xl:w-[15%] lg:min-w-[250px] lg:sticky lg:top-0 lg:h-auto lg:self-start lg:bg-glass"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Mobile overlay — tapping it closes the sidebar */}
      <div
        role="presentation"
        onClick={closeSidebar}
        className="sidBarOvelay w-full h-full fixed top-0 right-0 bg-[#00000045] block lg:hidden transition-opacity duration-300"
      />

      {/* Sidebar panel */}
      <div className="w-[80%] max-w-[320px] lg:w-full flex flex-col border-white/80 bg-glass lg:bg-glass !bg-white dark:!bg-[var(--bg-secondary)] lg:!bg-transparent z-50 h-full lg:h-[90vh] lg:rounded-2xl p-2 transition-transform duration-300 justify-between">
        {/* Header: logo + close button */}
        <div className="flex items-center justify-between mb-8 mt-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              const target = isAdminSection ? "/admin" : "/";
              if (pathname === target) return;
              router.push(target);
              setExpandedMenu(null);
              closeSidebarOnMobile();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const target = isAdminSection ? "/admin" : "/";
                if (pathname === target) return;
                router.push(target);
                setExpandedMenu(null);
                closeSidebarOnMobile();
              }
            }}
            className="flex items-center gap-3 cursor-pointer"
            aria-label="Go to home"
          >
            <Image
              src="/favicon.ico"
              alt="Themiify logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold text-[var(--primary-color)]">
              Themiify
            </h1>
          </div>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="lg:hidden text-rose-800 hover:bg-[var(--bg-tertiary)] p-2 rounded-lg transition-all duration-300 cursor-pointer"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Menu */}
        <ul className="flex-1 space-y-2 sidebar-menu pb-4" role="list">
          {visibleMenuItems.map((item) => {
            const fullPath = isAdminSection ? item.adminPath : item.userPath;
            const isHome = fullPath === "/" || fullPath === "/admin";
            const isActive = isHome
              ? pathname === fullPath
              : pathname === fullPath || pathname.startsWith(fullPath + "/");
            const isTheme = item.id === "theme";

            return (
              <li key={item.id} className="transition-all duration-300 ">
                {isTheme ? (
                  <ThemeMenuItem
                    item={item}
                    fullPath={fullPath}
                    isActive={isActive}
                    isExpanded={expandedMenu === "theme"}
                    platforms={platforms}
                    activePlatform={activePlatform}
                    onToggleExpand={() =>
                      setExpandedMenu((prev) =>
                        prev === "theme" ? null : "theme",
                      )
                    }
                    onNavigate={handleNavigation}
                    onPlatformNavigate={handleNavigation}
                  />
                ) : (
                  <RegularMenuItem
                    item={item}
                    fullPath={fullPath}
                    isActive={isActive}
                    onNavigate={(path) => {
                      setExpandedMenu(null);
                      handleNavigation(path);
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border-color)] pt-3 ">
          <Link
            href="https://themiify.com/"
            className="flex items-center justify-center rounded-full px-3 py-2 text-xs font-medium text-white transition-all duration-300 gradient-primary md:hidden"
            aria-label="العودة للموقع"
          >
            العودة للموقع
          </Link>

          {hasAdminAccess ? (
            isAdminSection ? (
              <Link
                href="/themes"
                className="flex items-center justify-center rounded-full px-3 py-2 text-xs font-medium text-white transition-all duration-300 gradient-secondary md:hidden"
                aria-label="تصفح الثيمات"
              >
                تصفح الثيمات
              </Link>
            ) : (
              <Link
                href="/admin"
                className="flex items-center justify-center rounded-full px-3 py-2 text-xs font-medium text-white transition-all duration-300 gradient-primary md:hidden"
                aria-label="الداشبورد"
              >
                الداشبورد
              </Link>
            )
          ) : null}

          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 transition-all duration-300 hover:bg-red-50"
              aria-label="Logout"
            >
              <TbLogout size={16} />
              <span>تسجيل خروج</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => {
                setExpandedMenu(null);
                closeSidebarOnMobile();
              }}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-primary transition-all duration-300 hover:bg-primary/5"
              aria-label="Login"
            >
              <FaSignInAlt size={16} />
              <span>تسجيل دخول</span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
};

// ─── Public Export (wrapped in Suspense for useSearchParams) ──────────────────

const SideBar: React.FC = () => (
  <Suspense
    fallback={
      <SidebarSkeleton className="md:w-[20%] xl:w-[15%] md:min-w-[250px] w-full h-[90vh] relative md:relative top-0 right-0 z-50" />
    }
  >
    <SideBarContent />
  </Suspense>
);

export default SideBar;
