"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FaCalendar,
  FaEdit,
  FaImage,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { BiSearch } from "react-icons/bi";
import DeleteButton from "@/components/ui/DeleteButton";
import { IBlog } from "@/lib/api/blogs";
import {
  ISupportCategory,
  fetchAdminSupportCategories,
} from "@/lib/api/support-categories";
import { stripHtml } from "@/lib/utils";

export interface PaginationInfo {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
}

interface AdminEssaysClientProps {
  initialEssays: IBlog[];
  initialCategories?: ISupportCategory[];
  pagination?: PaginationInfo;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "-";
  }
};

export default function AdminEssaysClient({
  initialEssays = [],
  initialCategories = [],
  pagination,
  onDelete,
}: AdminEssaysClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categories, setCategories] =
    useState<ISupportCategory[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">(
    "all",
  );
  const [clientPage, setClientPage] = useState(1);
  const itemsPerPage = 8;

  // جلب الفئات كـ Fallback في حالة عدم توفرها عبر الخادم
  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetchAdminSupportCategories().then((cats) => {
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
      });
    }
  }, [initialCategories]);

  // قائمة التبويبات الديناميكية
  const tabs = useMemo(() => {
    const list: { id: number | "all"; name: string }[] = [
      { id: "all", name: "الكل" },
    ];
    categories.forEach((cat) => {
      list.push({ id: cat.id, name: cat.name });
    });
    return list;
  }, [categories]);

  // تصفية المقالات حسب البحث والتصنيف
  const filteredEssays = useMemo(() => {
    return initialEssays.filter((essay) => {
      const title = (essay.title || essay.name || "").toLowerCase();
      const desc = (essay.description || essay.content || "").toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !query || title.includes(query) || desc.includes(query);

      if (!matchesSearch) return false;

      if (activeCategoryId === "all") return true;

      const activeCat = categories.find((c) => c.id === activeCategoryId);
      const matchesId = essay.category_id === activeCategoryId;
      const matchesName =
        activeCat &&
        essay.category?.trim().toLowerCase() ===
          activeCat.name.trim().toLowerCase();

      return matchesId || matchesName;
    });
  }, [initialEssays, searchQuery, activeCategoryId, categories]);

  // التحقق من نوع الترقيم (خادم أو عميل)
  const isServerPagination = Boolean(
    !searchQuery &&
    activeCategoryId === "all" &&
    pagination &&
    (pagination.last_page || 1) > 1,
  );

  const totalPages = isServerPagination
    ? pagination?.last_page || 1
    : Math.ceil(filteredEssays.length / itemsPerPage) || 1;

  const currentPage = isServerPagination
    ? pagination?.current_page || 1
    : clientPage;

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>([1, totalPages]);
    for (let p = currentPage - 1; p <= currentPage + 1; p += 1) {
      if (p > 1 && p < totalPages) {
        pages.add(p);
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  // المقالات المعروضة في الصفحة الحالية
  const displayedEssays = useMemo(() => {
    if (isServerPagination) {
      return filteredEssays;
    }
    const startIndex = (clientPage - 1) * itemsPerPage;
    return filteredEssays.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEssays, clientPage, isServerPagination, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (isServerPagination) {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("page", String(newPage));
      router.push(`${pathname}?${params.toString()}`);
    } else {
      setClientPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleTabChange = (tabId: number | "all") => {
    setActiveCategoryId(tabId);
    setClientPage(1);
  };

  return (
    <div
      className="w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-100 dark:border-zinc-800 shadow-sm"
      dir="rtl"
    >
      {/* ─── Top Header & Search ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        {/* Title and Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-right"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1.5">
            دليلك لتجربة متجر أفضل
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            محتوى مبني على أفضل ممارسات تجربة المستخدم والتجارة الإلكترونية
          </p>
        </motion.div>

        {/* Search Bar & Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72 min-w-[200px]">
            <input
              type="text"
              placeholder="ابحث عن ما يهمك..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setClientPage(1);
              }}
              className="w-full bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-full py-2.5 px-4 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            <BiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          </div>

          {/* Add Essay Button */}
          <Link
            href="/admin/essays/add"
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg text-sm whitespace-nowrap active:scale-95"
          >
            <IoMdAdd size={20} />
            <span>إضافة مقال</span>
          </Link>
        </div>
      </div>

      {/* ─── Filter Tabs (Pills) ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const isActive = activeCategoryId === tab.id;
          return (
            <button
              key={String(tab.id)}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-gray-100/90 dark:bg-zinc-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* ─── Articles List ───────────────────────────────────────── */}
      {displayedEssays.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg text-white text-3xl">
            ✍️
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {searchQuery
              ? "لا توجد نتائج بحث"
              : "لا توجد مقالات في هذا التصنيف"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            {searchQuery
              ? `لم يتم العثور على مقالات تطابق "${searchQuery}"`
              : "يمكنك إضافة مقال جديد أو اختيار تصنيف آخر"}
          </p>
          {(searchQuery || activeCategoryId !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategoryId("all");
                setClientPage(1);
              }}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold transition-all"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {displayedEssays.map((essay) => {
              const titleText = essay.title || essay.name || "مقال بدون عنوان";
              const img = essay.image_url || essay.image;
              const cleanExcerpt = stripHtml(
                essay.description || essay.content || "",
              );

              return (
                <motion.div
                  key={essay.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-zinc-900/90 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex flex-col md:flex-row items-stretch gap-5">
                    {/* 1. Image on the Right in RTL flex-row */}
                    <div className="w-full md:w-64 lg:w-72 h-44 rounded-2xl overflow-hidden relative flex-shrink-0 bg-gray-100 dark:bg-zinc-800">
                      {img &&
                      typeof img === "string" &&
                      !img.includes("[object") &&
                      img.trim() ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={titleText}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden",
                            );
                          }}
                        />
                      ) : null}

                      {/* Image Placeholder */}
                      <div
                        className={`w-full h-full flex items-center justify-center bg-gray-100 dark:bg-zinc-800 ${
                          img &&
                          typeof img === "string" &&
                          !img.includes("[object") &&
                          img.trim()
                            ? "hidden"
                            : ""
                        }`}
                      >
                        <FaImage className="text-gray-400 text-3xl" />
                      </div>

                      {/* Floating Action Buttons (Edit & Delete) on top of image */}
                      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                        {/* Edit Button */}
                        <Link
                          href={`/admin/essays/edit/${essay.id}`}
                          className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          title="تعديل المقال"
                        >
                          <FaEdit size={15} />
                        </Link>

                        {/* Delete Button */}
                        <DeleteButton
                          onDelete={() => onDelete(essay.id.toString())}
                          itemName={`المقال "${titleText}"`}
                          confirmMessage="هل انت متأكد من حذف هذا العنصر"
                          iconOnly
                          className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 2. Content on the Left in RTL flex-row */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        {/* Date and Category */}
                        <div className="flex items-center gap-3 mb-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5 font-medium">
                            <FaCalendar className="text-orange-500 text-xs" />
                            <span>{formatDate(essay.created_at)}</span>
                          </div>
                          {(() => {
                            const catName =
                              essay.category ||
                              categories.find((c) => c.id === essay.category_id)
                                ?.name;
                            if (!catName) return null;
                            return (
                              <span className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                                {catName}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                          <Link
                            href={`/admin/essays/${essay.id}`}
                            className="hover:text-orange-500 transition-colors"
                          >
                            {titleText}
                          </Link>
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4">
                          {cleanExcerpt}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ─── Pagination ──────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10" dir="ltr">
          {/* Prev Button (Dark Circle) */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full bg-[#1b2234] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            title="الصفحة السابقة"
          >
            <FaArrowLeft size={13} />
          </button>

          {/* Dots / Page Indicators */}
          <div className="flex items-center gap-2">
            {visiblePageNumbers.map((p, index) => {
              const prev = visiblePageNumbers[index - 1];
              const showGap = typeof prev === "number" && p - prev > 1;
              const isCurrent = p === currentPage;
              return (
                <React.Fragment key={p}>
                  {showGap ? (
                    <span className="px-1 text-gray-400 text-xs select-none">
                      ...
                    </span>
                  ) : null}
                  <button
                    onClick={() => handlePageChange(p)}
                    className={`transition-all rounded-full ${
                      isCurrent
                        ? "w-3 h-3 bg-[#1b2234] dark:bg-white scale-110"
                        : "w-2 h-2 bg-gray-300 dark:bg-zinc-600 hover:bg-gray-400"
                    }`}
                    title={`الصفحة ${p}`}
                  />
                </React.Fragment>
              );
            })}
          </div>

          {/* Next Button (Light Circle) */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm active:scale-95"
            title="الصفحة التالية"
          >
            <FaArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
