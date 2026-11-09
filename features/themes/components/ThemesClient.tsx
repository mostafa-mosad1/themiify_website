/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense } from "react";
import { useUserData } from "@/lib/hooks/useUserData";
import { useCache, CACHE_DURATION } from "@/lib/hooks/useCache";
import ThemeCard from "@/components/ui/ThemeCard";
import CategoryFilterBar from "@/components/shared/CategoryFilterBar";
import type { Category } from "@/lib/types";
import { BiSearch } from "react-icons/bi";
import { motion } from "framer-motion";
import { fetchThemes } from "@/lib/api/themes";
import { fetchClientCategories } from "@/lib/api/categories";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
// Defines the TypeScript interfaces used for data structures within this file.

interface ThemeDemo {
  id: string | number;
  icon_name: string;
  url: string;
  image_url: string;
  order: number;
}

interface Theme {
  id: string | number;
  name: string;
  imageUrl: string;
  price: number;
  userGuideUrl: string;
  previewLink: string;
  buyLink: string;
  categoryName: string;
  categoryId?: string | number | null;
  platformName: string;
  platformId?: string | number | null;
  demos: ThemeDemo[];
}

// Category is imported from @/lib/types

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Utility functions used across the component for data processing and formatting.

/** Returns the first image URL from the stored images field (supports array or object shapes). */
function extractImageUrl(images: unknown): string {
  if (!images) return "";

  let parsed = images;
  if (typeof images === "string") {
    try {
      parsed = JSON.parse(images);
    } catch {
      return images;
    }
  }

  if (typeof parsed !== "object" || parsed === null) return "";

  if (!Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    const mainImages = obj.main_images;
    const previews = obj.previews;
    if (Array.isArray(mainImages) && mainImages.length > 0)
      return mainImages[0] as string;
    if (Array.isArray(previews) && previews.length > 0)
      return previews[0] as string;
  }

  if (Array.isArray(parsed) && parsed.length > 0) return parsed[0] as string;

  return "";
}

// ─── Skeleton Component ───────────────────────────────────────────────────────
// A loading placeholder displayed while the theme data is being fetched.
const ThemeCardSkeleton = () => (
  <div className="bg-glass rounded-[30px] p-6 shadow-lg animate-pulse">
    <div className="h-[250px] w-full bg-gray-200 rounded-[20px] mb-5" />
    <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
    <div className="h-8 w-1/2 bg-gray-200 rounded mb-4" />
    <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
    <div className="flex gap-3">
      <div className="flex-1 h-10 bg-gray-200 rounded-[30px]" />
      <div className="flex-1 h-10 bg-gray-200 rounded-[30px]" />
    </div>
  </div>
);

// ─── No Results Component ─────────────────────────────────────────────────────
// Animated UI component displayed when no themes match the current search or filters.
const NoResults = ({
  searchQuery,
  router,
}: {
  searchQuery: string;
  router: ReturnType<typeof useRouter>;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
    className="text-center py-16"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
      className="relative w-32 h-32 mx-auto mb-6"
    >
      <motion.div
        animate={{
          rotate: [0, 15, -15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute inset-0"
      >
        <svg
          className="w-full h-full text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="10" cy="10" r="7" />
          <path d="M15 15L21 21" strokeLinecap="round" />
        </svg>
      </motion.div>

      <motion.div
        animate={{
          y: [-10, -20, -10],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.5,
        }}
        className="absolute -top-2 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary/30 rounded-full" />
          <div className="w-2 h-2 bg-primary/50 rounded-full" />
          <div className="w-2 h-2 bg-primary/70 rounded-full" />
        </div>
      </motion.div>
    </motion.div>

    <motion.h3
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-2xl font-bold text-gray-700 mb-2"
    >
      لا توجد نتائج
    </motion.h3>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-gray-500 mb-6"
    >
      لم نتمكن من العثور على &quot;{searchQuery}&quot;
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex gap-3 justify-center"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.refresh()}
        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        تحديث الصفحة
      </motion.button>
    </motion.div>
  </motion.div>
);

// ─── Pagination Component ─────────────────────────────────────────────────────
// Handles the rendering and logic for navigating between pages of themes.

const ITEMS_PER_PAGE = 12;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSelect?: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onPageSelect,
}: PaginationProps) => {
  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-5 mt-12 pb-8 select-none"
      dir="ltr"
    >
      {/* Left Circular Arrow Button */}
      <motion.button
        type="button"
        whileHover={{ scale: currentPage > 1 ? 1.08 : 1 }}
        whileTap={{ scale: currentPage > 1 ? 0.92 : 1 }}
        onClick={onPrev}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className={`relative w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
          currentPage > 1
            ? "bg-[#111827] text-white hover:bg-[#1f2937] shadow-slate-900/25 border-b-2 border-[#f97316]"
            : "bg-[#1f2937]/50 text-white/30 cursor-not-allowed opacity-50 border-b-2 border-transparent"
        }`}
      >
        <svg
          className="w-5 h-5 transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </motion.button>

      {/* Center Dots Indicator */}
      <div className="flex items-center gap-2.5 px-2">
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageSelect?.(p)}
              aria-label={`Go to page ${p}`}
              className={`rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                isActive
                  ? "w-3 h-3 bg-[#111827] scale-110 shadow-sm"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400 hover:scale-125"
              }`}
            />
          );
        })}
      </div>

      {/* Right Circular Arrow Button */}
      <motion.button
        type="button"
        whileHover={{ scale: currentPage < totalPages ? 1.08 : 1 }}
        whileTap={{ scale: currentPage < totalPages ? 0.92 : 1 }}
        onClick={onNext}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className={`relative w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
          currentPage < totalPages
            ? "bg-white text-[#111827] hover:bg-gray-50 border border-gray-100 shadow-gray-200/60 border-b-2 border-[#f97316]"
            : "bg-white/80 text-gray-300 border border-gray-100 cursor-not-allowed opacity-50 border-b-2 border-transparent"
        }`}
      >
        <svg
          className="w-5 h-5 transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </motion.button>
    </motion.div>
  );
};

// ─── CategoryFilterBar ────────────────────────────────────────────────────────
// Imported from @/components/shared/CategoryFilterBar

// ─── PageHeader Component ─────────────────────────────────────────────────────
// Renders the top section of the page, including the title, search bar, and category filters.

interface PageHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
}

const PageHeader = ({
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  onSelectCategory,
}: PageHeaderProps) => (
  <div className="mb-8">
    <div className="flex justify-between lg:items-center gap-4 flex-1 flex-col lg:flex-row">
      <h1 className="md:text-xl text-lg  font-bold !text-black  dark:text-white flex-1">
        تصفح الثيمات حسب القطاع
      </h1>

      <div className="flex flex-col md:flex-row justify-between  flex-1  md:items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-1/2 ms-auto overflow-hidden !rounded-full border border-gray-300 bg-white py-2 px-6 shadow-md transition-shadow focus-within:ring-2 focus-within:ring-orange-500/25 dark:border-zinc-600 dark:bg-zinc-900">
          <BiSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="ابحث عن ثيمك المفضل..."
            className="w-full outline-none px-2 py-1 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>

    {/* Category filter */}
    {categories.length > 0 && (
      <div className="CategoryFilter py-6">
        <CategoryFilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      </div>
    )}
  </div>
);

const STATIC_TIMELINE = [
  { number: 1, title: "إنشاء حساب" },
  { number: 2, title: "اختيار الثيم" },
  { number: 3, title: "الشراء" },
  { number: 4, title: "التطبيق" },
  { number: 5, title: "التخصيص" },
];

// ─── Main Page Content Component ──────────────────────────────────────────────
// This is the core component that manages state, fetches data, applies filters,
// and renders the grid of themes or appropriate loading/error states.

const PageContent = () => {
  const currentStep = 3;
  const totalSteps = STATIC_TIMELINE.length;
  const progressWidthPercent =
    totalSteps > 1
      ? ((currentStep - 1) / (totalSteps - 1)) * (100 - 100 / totalSteps)
      : 0;

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // ── URL-Driven State Management ─────────────────────────────────────────────
  // Initializes and synchronizes local component state with URL query parameters
  // to ensure filters are shareable and persist across reloads.
  const platformQuery = searchParams.get("platform");
  const categoryQuery = searchParams.get("category");
  const pageQuery = searchParams.get("page");
  const currentPageFromUrl = pageQuery
    ? Math.max(1, parseInt(pageQuery, 10))
    : 1;

  const [searchQuery, setSearchQuery] = useState("");
  const selectedCategory = categoryQuery ?? null;
  const selectedPlatform = platformQuery ?? null;
  const currentPage = currentPageFromUrl;

  /** Navigate to themes page with updated category query param */
  const handleSelectCategory = (categoryName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryName) {
      params.set("category", categoryName);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { loading: userLoading } = useUserData();

  // ── Data Fetching ───────────────────────────────────────────────────────────
  // Retrieves themes, categories, and platforms data from backend APIs.
  // Uses a caching mechanism to improve performance and reduce redundant network requests.
  const {
    data: themesResponse,
    loading: themesLoading,
    error,
    refresh,
  } = useCache<{ themes: any[]; pagination?: any }>(
    `themes_page_${currentPage}`,
    async () => {
      const res = await fetchThemes({ page: currentPage });
      return { themes: res.themes || [], pagination: res.pagination };
    },
    { duration: CACHE_DURATION.THEMES },
  );

  const rawThemes = useMemo(
    () => themesResponse?.themes ?? [],
    [themesResponse?.themes],
  );
  const paginationMeta = themesResponse?.pagination;

  const { data: rawCategories, loading: categoriesLoading } = useCache<
    Category[]
  >(
    "categories",
    async () => {
      const res = await fetchClientCategories();
      return (res.categories || []) as unknown as Category[];
    },
    { duration: CACHE_DURATION.CATEGORIES },
  );

  const allCategories = useMemo<Category[]>(
    () => rawCategories ?? [],
    [rawCategories],
  );

  const platformsLoading = false;

  // ── Data Transformation (Derived Data) ──────────────────────────────────────
  // Processes raw API responses into structured formats suitable for the UI components.

  const allThemes = useMemo<Theme[]>(() => {
    return (
      rawThemes
        ?.filter((theme: any) => theme.is_visible !== false)
        .map((theme: any) => ({
          id: theme.id,
          name: theme.name || "بدون اسم",
          imageUrl:
            extractImageUrl(theme.images) ||
            theme.image_url ||
            "/placeholder-image.jpg",
          price: Number(theme.price) || 0,
          userGuideUrl: theme.inspect_link || "#",
          previewLink: theme.inspect_link || "",
          buyLink: theme.buy_link || "",
          categoryName: theme.category_name || theme.category?.name || "",
          categoryId: theme.category_id || theme.category?.id || null,
          platformName: theme.platform_name || theme.platform?.name || "",
          platformId: theme.platform_id || theme.platform?.id || null,
          demos: theme.demos || theme.theme_demos || [],
        })) ?? []
    );
  }, [rawThemes]);

  const isPlatformMatch = (themePlatform: string, selected: string | null) => {
    if (!selected) return true;
    const t = (themePlatform || "").trim().toLowerCase();
    const s = (selected || "").trim().toLowerCase();
    if (t === s) return true;
    if ((t === "salla" || t === "سلة") && (s === "salla" || s === "سلة"))
      return true;
    if ((t === "zid" || t === "زد") && (s === "zid" || s === "زد")) return true;
    if (
      (t === "shopify" || t === "شوبيفاي") &&
      (s === "shopify" || s === "شوبيفاي")
    )
      return true;
    if ((t === "youcan" || t === "يوكان") && (s === "youcan" || s === "يوكان"))
      return true;
    return false;
  };

  /**
   * When a platform is selected → show only the categories that
   * actually have themes for that platform (derived from themes data).
   * When no platform is selected ("كل الثيمات") → show ALL categories.
   */
  const visibleCategories = useMemo<Category[]>(() => {
    if (!selectedPlatform) return allCategories;

    const categoryNamesForPlatform = new Set(
      allThemes
        .filter((t) => isPlatformMatch(t.platformName, selectedPlatform))
        .map((t) => t.categoryName)
        .filter(Boolean),
    );

    const filtered = allCategories.filter((cat) =>
      categoryNamesForPlatform.has(cat.name),
    );

    return filtered.length > 0 ? filtered : allCategories;
  }, [selectedPlatform, allThemes, allCategories]);

  // ── Filtering Logic ─────────────────────────────────────────────────────────
  // Applies the current search query, selected category, and selected platform
  // to filter the list of themes.

  const filteredThemes = allThemes.filter((theme) => {
    const matchesSearch = theme.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === null ||
      (theme.categoryName &&
        theme.categoryName.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase()) ||
      allCategories.some(
        (c) =>
          String(c.name).trim().toLowerCase() ===
            selectedCategory.trim().toLowerCase() &&
          String(c.id) === String(theme.categoryId),
      );
    const matchesPlatform = isPlatformMatch(
      theme.platformName,
      selectedPlatform,
    );
    return matchesSearch && matchesCategory && matchesPlatform;
  });

  // ── Pagination Logic ────────────────────────────────────────────────────────
  const isServerPagination = Boolean(
    paginationMeta &&
    (paginationMeta.last_page > 1 || paginationMeta.total > 12),
  );

  const totalPages = isServerPagination
    ? paginationMeta?.last_page || 1
    : Math.max(1, Math.ceil(filteredThemes.length / ITEMS_PER_PAGE));

  const paginatedThemes = isServerPagination
    ? filteredThemes
    : filteredThemes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      );

  // ── UI: Loading State ───────────────────────────────────────────────────────
  // Renders the skeleton placeholders while initial data is being fetched.

  if (themesLoading || userLoading || categoriesLoading || platformsLoading) {
    return (
      <section className="container mx-auto px-4">
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="flex gap-4">
            <div className="h-12 w-1/2 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-12 w-32 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <ThemeCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  // ── UI: Error State ─────────────────────────────────────────────────────────
  // Renders an error message and a retry button if any of the API requests fail.

  if (error) {
    return (
      <section className="container mx-auto px-6 bg-glass">
        <PageHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={visibleCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
        <div className="text-center py-16">
          <div className="bg-glass text-red-500 p-8 rounded-2xl inline-block max-w-md">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xl font-bold mb-2">حدث خطأ!</p>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => refresh()}
              className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-primary/80 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── UI: Main Render (Success State) ─────────────────────────────────────────
  // Renders the complete page UI including headers, filter results, and pagination.

  return (
    <section className=" mx-auto p-6  min-h-[85vh]">
      <div className="md:my-4 my-2">
        <p className="md:text-2xl text-xl font-bold text-black dark:text-white mb-2">
          اكتشف مجموعة الثيمات المصممة خصيصًا لمتجرك
        </p>
        <p className="text-black dark:text-white text-lg font-normal max-w-3xl">
          اختَر الثيم اللي يناسب نشاطك ويقدّم تجربة تسوّق مميزة
        </p>
      </div>

      {/* Timeline Bar (الـ Stepper مع ملء حتى الخطوة الثالثة بلون مميز) */}
      <div className="mb-8 md:mb-14 w-full py-2">
        <div className="max-w-4xl">
          <div className="relative flex items-center justify-between">
            {/* الخط الأساسي الرمادي المجوف */}
            <div
              className="step-track-line absolute z-0 top-[22px] sm:top-[28px] md:top-[29px] -translate-y-1/2"
              style={{
                right: `${100 / (totalSteps * 2)}%`,
                left: `${100 / (totalSteps * 2)}%`,
              }}
            />

            {/* خط التقدم الممتلئ حتى الخطوة الثالثة بلون برتقالي مميز */}
            {progressWidthPercent > 0 && (
              <div
                className="absolute z-0 h-[6px] md:h-[7px] rounded-full bg-gradient-to-l from-[#ea580c] via-[#f26a21] to-[#fb923c] top-[22px] sm:top-[28px] md:top-[29px] -translate-y-1/2 transition-all duration-700 ease-out shadow-[0_2px_8px_rgba(242,106,33,0.35)]"
                style={{
                  right: `${100 / (totalSteps * 2)}%`,
                  width: `${progressWidthPercent}%`,
                }}
              />
            )}

            {STATIC_TIMELINE.map((item) => {
              const isStepDone = item.number <= currentStep;

              return (
                <Link prefetch={false}
                  key={item.number}
                  href={`/#step-${item.number}`}
                  className="flex-1 flex flex-col items-center relative z-10 text-center px-0.5 sm:px-1 cursor-pointer group no-underline"
                >
                  {/* دائرة الرقم بتأثير البوكس شادو الداخلي */}
                  <div
                    className={`step-circle flex h-11 w-11 sm:h-14 sm:w-14 md:h-[58px] md:w-[58px] items-center justify-center rounded-full text-sm sm:text-base md:text-xl font-extrabold select-none transition-all duration-300 group-hover:scale-105 ${
                      isStepDone
                        ? "text-[var(--primary-color)] dark:text-[var(--primary-color)] shadow-[0_2px_12px_rgba(242,106,33,0.2)]"
                        : "text-[#0e132c] dark:text-white"
                    }`}
                  >
                    {item.number}
                  </div>

                  {/* عنوان الخطوة */}
                  <span
                    className={`mt-2.5 sm:mt-3 md:mt-3.5 text-[11px] sm:text-xs md:text-sm font-bold text-center leading-tight transition-colors ${
                      isStepDone
                        ? "text-[var(--primary-color)] dark:text-[var(--primary-color)]"
                        : "text-slate-800 dark:text-slate-200 group-hover:text-[var(--primary-color)]"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-white/80 bg-glass shadow-sm backdrop-blur-3xl transition-all duration-300 p-4">
      <PageHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={visibleCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      <main className="all-themes mt-8 ">
        {filteredThemes.length === 0 && searchQuery ? (
          /* No search results */
          <NoResults searchQuery={searchQuery} router={router} />
        ) : filteredThemes.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">لا توجد ثيمات متاحة</p>
          </div>
        ) : (
          /* Theme grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:pl-4 themes-grid">
            {paginatedThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                id={theme.id}
                name={theme.name}
                imageUrl={theme.imageUrl}
                price={theme.price}
                userGuideUrl={theme.userGuideUrl}
                previewLink={theme.previewLink}
                buyLink={theme.buyLink}
                demos={theme.demos}
                author=""
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => handlePageChange(currentPage - 1)}
            onNext={() => handlePageChange(currentPage + 1)}
            onPageSelect={(p) => handlePageChange(p)}
          />
        )}
      </main>
      </div>

    </section>
  );
};

// ─── Main Page Export ─────────────────────────────────────────────────────────
// Wraps the PageContent component in a Suspense boundary as required by Next.js
// for components that use useSearchParams().
const Page = () => (
  <Suspense
    fallback={
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-10 w-64 bg-gray-200 rounded mb-4" />
      </div>
    }
  >
    <PageContent />
  </Suspense>
);

export default Page;
