/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, Suspense } from "react";
import { fetchBlogs, IBlog } from "@/lib/api/blogs";
import {
  fetchSupportClientCategories,
  ISupportCategory,
} from "@/lib/api/support-categories";
import { useCache, CACHE_DURATION } from "@/lib/hooks/useCache";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaCalendar, FaImage } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { useRouter, useSearchParams } from "next/navigation";
import { stripHtml } from "@/lib/utils";

type Essay = IBlog;

const formatEssayDate = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ─── Skeleton Component ─────────────────────────────
// ─── Skeleton Component ─────────────────────────────
const EssayCardSkeleton = () => (
  <div className="bg-glass rounded-2xl overflow-hidden shadow animate-pulse border border-gray-100">
    <div className="flex">
      {/* صورة Skeleton */}
      <div className="w-1/3 h-auto bg-gray-200"></div>

      {/* محتوى Skeleton */}
      <div className="p-6 w-2/3">
        {/* التاريخ والمشاهدات */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4  rounded"></div>
            <div className="w-24 h-4  rounded"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4  rounded"></div>
            <div className="w-12 h-4  rounded"></div>
          </div>
        </div>

        {/* العنوان */}
        <div className="h-7 w-3/4  rounded mb-3"></div>

        {/* الوصف - 3 أسطر */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full  rounded"></div>
          <div className="h-4 w-5/6  rounded"></div>
          <div className="h-4 w-4/6  rounded"></div>
        </div>

        {/* رابط قراءة المزيد */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-32  rounded"></div>
          <div className="w-5 h-5  rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Essay Card Component ───────────────────────────
const EssayCard = ({ essay }: { essay: Essay }) => {
  const titleText = essay.title || essay.name || "مقال بدون عنوان";
  const img = essay.image_url || essay.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative z-0 rounded-2xl border border-white/70 bg-glass shadow-[0_8px_24px_rgba(15,23,42,0.10),0_2px_6px_rgba(15,23,42,0.06)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:z-10 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-[0_18px_36px_rgba(15,23,42,0.16),0_6px_12px_rgba(242,107,33,0.10)] dark:border-white/10"
    >
      <Link prefetch={false}
        href={`/essays/${essay.id}`}
        className="no-underline flex flex-col lg:flex-row lg:p-6"
      >
        {/* الصورة في الأعلى */}
        <div className="lg:w-2/5 w-full relative overflow-hidden bg-gray-100 rounded-lg h-56 ">
          {img &&
          typeof img === "string" &&
          !img.includes("[object") &&
          img.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={titleText}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}

          {/* Placeholder للصورة */}
          <div
            className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${img && typeof img === "string" && !img.includes("[object") && img.trim() ? "hidden" : ""}`}
          >
            <FaImage className="text-gray-400 text-4xl" />
          </div>
        </div>

        {/* المحتوى */}
        <div className="p-5 w-full lg:w-3/5">
          {/* التاريخ والمشاهدات في سطر واحد */}
          <div className="mb-3 flex items-center  gap-1.5 text-gray-500">
            <FaCalendar className="text-orange-500" aria-hidden="true" />
            <time
              dateTime={essay.created_at}
              className="text-right  text-[12.17px] font-normal leading-[149%] tracking-[0]"
            >
              {formatEssayDate(essay.created_at)}
            </time>
          </div>

          {/* العنوان */}
          <h3 className="md:text-xl text-sm font-bold  mb-2 !text-black group-hover:text-orange-500  transition-colors line-clamp-2">
            {titleText}
          </h3>

          {/* الوصف */}
          <p className=" mb-2 line-clamp-2 leading-relaxed text-neutral-600">
            {stripHtml(essay.description || essay.content || "")}
          </p>

          {/* رابط قراءة المزيد */}
          <Link prefetch={false} href={`/essays/${essay.id}`} className="flex items-center underline text-orange-500 font-semibold hover:text-orange-600 transition-colors">
            قراءة المقال كاملاً
          </Link>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── Main Page Component ────────────────────────────
function EssaysContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const activeTab = searchParams.get("category") || "الكل";
  const rawCurrentPage = Number(searchParams.get("page") || "1");
  const currentPage =
    Number.isFinite(rawCurrentPage) && rawCurrentPage > 0
      ? Math.floor(rawCurrentPage)
      : 1;
  const API_PAGE_SIZE = 3;

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "الكل") {
      params.delete("category");
    } else {
      params.set("category", tab);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(Math.max(1, page)));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const { data: blogPage, loading } = useCache<{
    blogs: Essay[];
    pagination?: any;
  }>(
    `essays_page_${currentPage}`,
    async () => {
      const res = await fetchBlogs({
        page: currentPage,
        per_page: API_PAGE_SIZE,
      });
      return {
        blogs: res.blogs || [],
        pagination: res.pagination,
      };
    },
    { duration: CACHE_DURATION.ESSAYS },
  );

  const { data: rawCategories } = useCache<ISupportCategory[]>(
    "support_categories",
    async () => {
      return await fetchSupportClientCategories();
    },
    { duration: CACHE_DURATION.CATEGORIES },
  );

  const essays = useMemo(() => blogPage?.blogs ?? [], [blogPage?.blogs]);
  const categories = useMemo(() => rawCategories ?? [], [rawCategories]);
  const paginationMeta = blogPage?.pagination;
  const totalPages = Math.max(
    1,
    Math.ceil(
      (paginationMeta?.total ?? essays.length) /
        (paginationMeta?.per_page || API_PAGE_SIZE),
    ),
  );

  // التابس الديناميكية من فئات الدعم
  const tabs = useMemo(() => {
    const list = ["الكل"];
    categories.forEach((cat) => {
      if (cat.name && !list.includes(cat.name)) {
        list.push(cat.name);
      }
    });
    return list;
  }, [categories]);

  // فلترة المقالات حسب البحث والتاب بدون ريكويستات شبكة
  const filteredEssays = useMemo(() => {
    let filtered = essays;

    if (searchQuery) {
      filtered = filtered.filter(
        (essay) =>
          (essay.title || essay.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (essay.description || essay.content || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    if (activeTab !== "الكل") {
      filtered = filtered.filter(
        (essay) =>
          essay.category === activeTab ||
          (essay as any).support_category?.name === activeTab ||
          (essay as any).category_name === activeTab,
      );
    }

    return filtered;
  }, [searchQuery, activeTab, essays]);

  const safePage = Math.min(currentPage, totalPages);
  const paginatedEssays = useMemo(() => filteredEssays, [filteredEssays]);

  return (
    <div className="min-h-screen">
      <div className="  rounded-3xl bg-glass px-3 py-3 sm:px-4 md:px-6">
        <div className="mb-4 flex flex-col gap-3 py-3 md:mb-6 md:flex-row md:items-center md:justify-between">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 text-right md:mb-8"
          >
            <h1 className="mb-2 text-lg !text-black font-bold md:text-2xl">
              دليلك لتجربة متجر أفضل
            </h1>
            <p className="text-sm text-gray-700 md:text-lg">
              محتوى مبني على أفضل ممارسات تجربة المستخدم والتجارة الإلكترونية
            </p>
          </motion.div>
          {/* Search */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="ابحث عن ما يهمك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-white dark:bg-zinc-800 px-5 py-2.5 pr-11 text-sm text-[var(--text-primary)] dark:text-gray-200 placeholder:text-gray-400 outline-none transition-all focus:ring-2 focus:ring-[var(--primary-color)]/20 shadow-[inset_1px_4px_8px_rgb(14_19_44_/_6%),inset_-2px_-4px_10px_rgb(255_255_255_/_20%),inset_0_-1px_0px_#0E132C0F] md:py-3"
            />
            <BiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
          </div>
        </div>
        {/* Search Bar - جنب التابس */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`h-[38px] whitespace-nowrap rounded-full px-3 text-[11px] font-medium transition-all duration-300 select-none sm:px-4 sm:text-xs md:h-[42px] md:px-5 md:text-sm ${
                  activeTab === tab
                    ? "gradient-primary text-white shadow-md !shadow-[inset_0px_2px_4px_0px_var(--shadow-color)]"
                    : "bg-white dark:bg-zinc-800 !text-[var(--text-primary)] dark:!text-gray-200 hover:!bg-gray-50 dark:hover:!bg-zinc-700 shadow-[inset_1px_4px_8px_rgb(14_19_44_/_6%),inset_-2px_-4px_10px_rgb(255_255_255_/_20%),inset_0_-1px_0px_#0E132C0F]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* مقالات - Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(6)].map((_, i) => (
              <EssayCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredEssays.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4"
          >
            <div className="max-w-md mx-auto  p-10 border border-gray-100">
              {/* أيقونة */}
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl rotate-12 flex items-center justify-center mb-8 shadow-lg">
                <svg
                  className="w-14 h-14 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              {/* محتوى */}
              <h3 className="text-2xl font-bold mb-3">
                {searchQuery ? "لا توجد نتائج" : "لا توجد مقالات"}
              </h3>

              <p className=" mb-8">
                {searchQuery
                  ? `لا توجد مقالات تطابق "${searchQuery}"`
                  : "لم يتم إضافة أي مقالات بعد"}
              </p>

              {/* أزرار */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-6 py-3 bg-gradient-to-l from-orange-500 to-orange-600 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    مسح البحث
                  </button>
                )}

                <button
                  onClick={() => router.refresh()}
                  className="px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  تحديث
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedEssays.map((essay) => (
              <EssayCard key={essay.id} essay={essay} />
            ))}
          </div>
        )}

        {!loading && filteredEssays.length > 0 && (
          <div className="mt-8 text-center text-gray-500">
            عرض {paginatedEssays.length} من {filteredEssays.length} مقال
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage <= 1}
              className="h-[38px] rounded-full bg-glass px-4 text-sm text-gray-700 disabled:opacity-40"
            >
              السابق
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`h-[38px] min-w-[38px] rounded-full px-3 text-sm ${
                    page === safePage
                      ? "gradient-primary text-white"
                      : "bg-glass text-gray-700"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage >= totalPages}
              className="h-[38px] rounded-full bg-glass px-4 text-sm text-gray-700 disabled:opacity-40"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EssaysPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <EssaysContent />
    </Suspense>
  );
}
