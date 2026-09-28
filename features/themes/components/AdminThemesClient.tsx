"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUserData } from "@/lib/hooks/useUserData";
import { useCache, CACHE_DURATION } from "@/lib/hooks/useCache";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import { resolveIcon } from "@/lib/utils/iconMap";
import ThemeCard from "@/components/ui/ThemeCard";
import { toast } from "sonner";
import { BiSearch } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAdminThemes, deleteAdminTheme } from "@/lib/api/themes";
import { fetchClientCategories } from "@/lib/api/categories";
import { fetchClientPlatforms } from "@/lib/api/platforms";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  platformName: string;
  demos: ThemeDemo[];
  isVisible: boolean;
}

interface Category {
  id: string | number;
  name: string;
  icon: string;
}

interface Platform {
  id: string | number;
  name: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the first image URL from the stored images field (supports array or object shapes). */
function extractImageUrl(images: unknown): string {
  const FALLBACK = "/placeholder-image.jpg";

  if (!images) return FALLBACK;

  let parsed = images;
  if (typeof images === "string") {
    try {
      parsed = JSON.parse(images);
    } catch {
      return images;
    }
  }

  if (typeof parsed !== "object" || parsed === null) return FALLBACK;

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

  return FALLBACK;
}

// ─── Skeleton ──────────────────────────────────────────
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

// ─── No Results Animation ─────────────────────────────
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
      لم نتمكن من العثور على "{searchQuery}"
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
      <Link href="/admin/themes/create">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          إضافة ثيم جديد
        </motion.button>
      </Link>
    </motion.div>
  </motion.div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────

const INITIAL_ITEMS = 8;
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

interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
  noPlatformSelected?: boolean;
}

const CategoryFilterBar = ({
  categories,
  selectedCategory,
  onSelectCategory,
  noPlatformSelected = false,
}: CategoryFilterBarProps) => {

  if (categories.length === 0) {
    return (
      <p className="text-sm text-gray-400 mt-2 italic">
        لا توجد تصنيفات لهذه المنصة
      </p>
    );
  }

  return (
    <div className="flex md:flex-wrap gap-1 md:gap-2 mt-1 overflow-x-scroll md:overflow-x-auto catFilter">
      <Button
        variant="solid"
        solidColor={selectedCategory === null ? "" : "#f3f4f6"}
        className={`text-sm justify-center transition-all ${
          selectedCategory === null
            ? "gradient-primary text-white shadow-md"
            : "!text-gray-700 hover:!bg-gray-200"
        } shadow-[inset_2px_4px_10px_rgb(14_19_44_/_10%),inset_-2px_-4px_10px_rgb(255_255_255_/_20%)] py-1 min-w-24`}
        onClick={() => onSelectCategory(null)}
      >
        # الكل
      </Button>
      {categories.map((category) => {
        const isActive = selectedCategory === category.name;
        const icon = resolveIcon(category.icon);
        return (
          <Button
            key={category.id}
            variant="solid"
            solidColor={isActive ? "" : "#f3f4f6"}
            className={`text-sm transition-all justify-center ${
              isActive
                ? "gradient-primary text-white shadow-md"
                : "!text-gray-700 hover:!bg-gray-200"
            } shadow-[inset_1px_4px_8px_rgb(14_19_44_/_6%),inset_-2px_-4px_10px_rgb(255_255_255_/_20%),inset_0_-1px_0px_#0E132C0F] py-2 px-6 min-w-40`}
            onClick={() => onSelectCategory(category.name)}
            icon={icon}
          >
            {category.name}
          </Button>
        );
      })}
    </div>
  );
};

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isAuthenticated: boolean;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
  selectedPlatform: string | null;
}

const PageHeader = ({
  searchQuery,
  setSearchQuery,
  isAuthenticated,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedPlatform,
}: PageHeaderProps) => (
  <div className="mb-8">
    <h1 className="text-2xl font-bold mb-4 !text-black">تصفح الثيمات حسب القطاع</h1>
    {/* Search bar + Add button */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2 w-full md:w-1/2 bg-glass border !rounded-full py-2 px-6">
        <BiSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="ابحث عن ثيمك المفضل..."
          className="w-full outline-none px-2 py-1 bg-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isAuthenticated && (
        <Button
          variant="secondary"
          url="/admin/themes/create"
          className="add-new-btn min-w-56 justify-center py-1 rounded-full text-white shadow-md gradient-secondary"
          icon={<FaPlus size={20} />}
          iconPosition="right"
        >
          إضافة ثيم جديد
        </Button>
      )}
    </div>

    {/* Category filter — platform-aware */}
    <div className="CategoryFilter">
      <h3>التصنيفات</h3>
      <CategoryFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />
    </div>
  </div>
);

// ─── Page Component ───────────────────────────────────────────────────────────

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const platformQuery = searchParams.get("platform");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(
    platformQuery ?? null,
  );
  const pageQuery = searchParams.get("page");
  const currentPageFromUrl = pageQuery ? Math.max(1, parseInt(pageQuery, 10)) : 1;
  const [currentPage, setCurrentPage] = useState(currentPageFromUrl);
  const [displayCount, setDisplayCount] = useState(INITIAL_ITEMS);
  const [loadingMore, setLoadingMore] = useState(false);

  // Keep local state in sync with URL
  useEffect(() => {
    setSelectedPlatform(platformQuery ?? null);
    setSelectedCategory(null);
    if (pageQuery) {
      setCurrentPage(Math.max(1, parseInt(pageQuery, 10)));
    }
  }, [platformQuery, pageQuery]);

  /** Navigate with updated platform query param */
  const handleSelectPlatform = (platformName: string | null) => {
    setSelectedPlatform(platformName);
    setSelectedCategory(null);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (platformName) {
      params.set("platform", platformName);
    } else {
      params.delete("platform");
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ استخدام useUserData
  const { isAdmin, isLoggedIn, loading: userLoading } = useUserData();

  // Fetch themes with pagination support
  const {
    data: themesResponse,
    loading: themesLoading,
    error,
    refresh,
  } = useCache<{ themes: any[]; pagination?: any }>(
    `admin_themes_page_${currentPage}`,
    async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken") ||
            localStorage.getItem("bearer_token") ||
            null
          : null;
      const res = await fetchAdminThemes(token, { page: currentPage });
      return { themes: res.themes || [], pagination: res.pagination };
    },
    { duration: CACHE_DURATION.THEMES }
  );

  const rawThemes = themesResponse?.themes ?? [];
  const paginationMeta = themesResponse?.pagination;

  // Fetch all categories
  const { data: rawCategories, loading: categoriesLoading } = useCache<
    Category[]
  >(
    "categories",
    async () => {
      const res = await fetchClientCategories();
      return res.categories;
    },
    { duration: CACHE_DURATION.CATEGORIES },
  );

  // Fetch all platforms
  const { data: rawPlatforms, loading: platformsLoading } = useCache<
    Platform[]
  >(
    "platforms",
    async () => {
      const res = await fetchClientPlatforms();
      return res.platforms;
    },
    { duration: CACHE_DURATION.PLATFORMS },
  );

  // Transform raw theme rows into the shape our UI expects
  const allThemes: Theme[] =
    rawThemes?.map((theme: any) => ({
      id: theme.id,
      name: theme.name || "بدون اسم",
      imageUrl:
        theme.banner_url ||
        theme.image_url ||
        extractImageUrl(
          theme.images || theme.banner
        ),
      price: typeof theme.price === "number" ? theme.price : parseFloat(theme.price || "0"),
      userGuideUrl: theme.inspect_link || "#",
      previewLink: theme.inspect_link || theme.preview_link || "",
      buyLink: theme.buy_link || "",
      categoryName: theme.category_name || theme.category?.name || "",
      platformName: theme.platform_name || theme.platform?.name || "",
      demos: theme.theme_demos || theme.demos || [],
      isVisible: theme.is_visible !== false,
    })) ?? [];

  const allCategories: Category[] = (rawCategories as any) ?? [];

  const platforms: Platform[] = (rawPlatforms as any) ?? [];

  const isPlatformMatch = (themePlatform: string, selected: string | null) => {
    if (!selected) return true;
    const t = (themePlatform || "").trim().toLowerCase();
    const s = (selected || "").trim().toLowerCase();
    if (t === s) return true;
    if ((t === "salla" || t === "سلة") && (s === "salla" || s === "سلة")) return true;
    if ((t === "zid" || t === "زد") && (s === "zid" || s === "زد")) return true;
    if ((t === "shopify" || t === "شوبيفاي") && (s === "shopify" || s === "شوبيفاي")) return true;
    if ((t === "youcan" || t === "يوكان") && (s === "youcan" || s === "يوكان")) return true;
    return false;
  };

  /**
   * When a platform is selected → show only categories that have
   * themes for that platform. When no platform ("كل الثيمات") → show all.
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

  // ─── Delete handler ──────────────────────────────────────────────────────────

  const handleDeleteTheme = async (id: string | number) => {
    try {
      const themeName =
        allThemes.find((theme) => String(theme.id) === String(id))?.name || "ثيم";

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken") ||
            localStorage.getItem("bearer_token") ||
            null
          : null;

      const res = await deleteAdminTheme(id, token);
      if (!res.success) {
        throw new Error(res.error || "فشل حذف الثيم");
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("cache_themes_all");
      }
      refresh();
      toast.success(`تم حذف الثيم: ${themeName} ✅`);
    } catch (error: any) {
      toast.error(`حدث خطأ أثناء الحذف: ${error.message}`);
    }
  };

  // ─── Visibility Toggle Handler ────────────────────────────────────────────

  const handleToggleVisibility = async (id: string | number, newState: boolean) => {
    try {
      toast.success(newState ? "تم إظهار الثيم" : "تم إخفاء الثيم");
      refresh();
    } catch (err: any) {
      toast.error(`خطأ: ${err.message}`);
      throw err;
    }
  };

  // ─── Filtering ───────────────────────────────────────────────────────────────

  const filteredThemes = allThemes.filter((theme) => {
    const matchesSearch = theme.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === null ||
      (theme.categoryName &&
        theme.categoryName.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
    const matchesPlatform = isPlatformMatch(theme.platformName, selectedPlatform);
    return matchesSearch && matchesCategory && matchesPlatform;
  });

  // ─── Progressive Loading Logic ────────────────────────────────────────────
  
  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(INITIAL_ITEMS);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedPlatform]);

  // Load more function
  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredThemes.length));
      setLoadingMore(false);
    }, 500); // Small delay for better UX
  };

  // ─── Pagination Logic ────────────────────────────────────────────────────
  const isServerPagination = Boolean(
    paginationMeta && (paginationMeta.last_page > 1 || paginationMeta.total > 12)
  );

  const totalPages = isServerPagination
    ? (paginationMeta?.last_page || 1)
    : Math.max(1, Math.ceil(filteredThemes.length / ITEMS_PER_PAGE));

  const displayedThemes = isServerPagination
    ? filteredThemes
    : filteredThemes.slice(0, displayCount);

  const hasMore = !isServerPagination && displayedThemes.length < filteredThemes.length;

  // ─── Loading state ───────────────────────────────────────────────────────────

  if (themesLoading || userLoading || categoriesLoading || platformsLoading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="flex gap-4">
            <div className="h-12 w-1/2 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-12 w-32 bg-gray-200 rounded-full animate-pulse" />
          </div>
          {/* Skeleton for category buttons */}
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
        {/* Show only INITIAL_ITEMS skeletons for faster initial load */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: INITIAL_ITEMS }, (_, i) => (
            <ThemeCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <section className="container mx-auto px-4 py-8">
        <PageHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isAuthenticated={isLoggedIn}
          categories={visibleCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedPlatform={selectedPlatform}
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

  // ─── Normal State ───────
  return (
    <section className=" mx-auto p-6 bg-glass min-h-[85vh]">
      <PageHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAuthenticated={isLoggedIn}
        categories={visibleCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedPlatform={selectedPlatform}
      />

      <main className="all-themes mt-4">
        <AnimatePresence mode="wait">
          {/* No search results */}
          {filteredThemes.length === 0 && searchQuery ? (
            <NoResults
              key="no-results"
              searchQuery={searchQuery}
              router={router}
            />
          ) : filteredThemes.length === 0 ? (
            /* Empty state */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <p className="text-xl text-gray-600 mb-4">لا توجد ثيمات متاحة</p>
              {isLoggedIn ? (
                <Button
                  onClick={() => router.push("/admin/themes/create")}
                  className="min-w-40"
                >
                  أضف أول ثيم الآن
                </Button>
              ) : (
                <Link
                  href="/login"
                  className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-primary/80 transition-colors"
                >
                  تسجيل الدخول لإضافة ثيم
                </Link>
              )}
            </motion.div>
          ) : (
            /* Theme grid with progressive loading */
            <>
              <motion.div
                key={`results-${selectedCategory ?? "all"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pl-4"
              >
                {displayedThemes.map((theme) => (
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
                    onDelete={(id) => handleDeleteTheme(id)}
                    onEdit={(id) => router.push(`/admin/themes/edit/${id}`)}
                    onToggleVisibility={handleToggleVisibility}
                    isVisible={theme.isVisible}
                    showActions={isLoggedIn}
                    author="admin"
                  />
                ))}
              </motion.div>
              
              {/* Load More Button */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center mt-8"
                >
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="min-w-40 gradient-primary text-white"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري التحميل...
                      </span>
                    ) : (
                      `تحميل المزيد (${displayedThemes.length}/${filteredThemes.length})`
                    )}
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
        {/* Pagination */}
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
    </section>
  );
};

export default Page;
