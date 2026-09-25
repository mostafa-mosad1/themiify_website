"use client";

import { useMemo, useState, Suspense } from "react";
import { fetchBlogs, IBlog } from "@/lib/api/blogs";
import { fetchSupportClientCategories, ISupportCategory } from "@/lib/api/support-categories";
import { useCache, CACHE_DURATION } from "@/lib/hooks/useCache";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaCalendar, FaEye, FaImage } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { useRouter, useSearchParams } from "next/navigation";
import { stripHtml } from "@/lib/utils";

type Essay = IBlog;
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // دالة لتوليد رقم عشوائي للمشاهدات (للتجميل)


  const titleText = essay.title || essay.name || "مقال بدون عنوان";
  const img = essay.image_url || essay.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-glass rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300  group"
    >
      <Link href={`/essays/${essay.id}`} className="no-underline flex flex-col lg:flex-row lg:p-6">
        {/* الصورة في الأعلى */}
        <div className="lg:w-2/5 w-full relative overflow-hidden bg-gray-100 rounded-lg h-56 ">
          {img && typeof img === "string" && !img.includes("[object") && img.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={titleText}
              className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-300"
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
          <div className="flex items-center justify-between text-gray-500 text-sm mb-3">
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
          <div className="flex items-center text-orange-500 font-semibold hover:text-orange-600 transition-colors">
            <span>قراءة المقال كاملاً</span>
            <span className="mr-2">←</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── Main Page Component ────────────────────────────
function EssaysContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("category") || "الكل");
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "الكل") {
      params.delete("category");
    } else {
      params.set("category", tab);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const { data: rawBlogs, loading } = useCache<Essay[]>(
    "essays",
    async () => {
      const { blogs } = await fetchBlogs();
      return blogs;
    },
    { duration: CACHE_DURATION.ESSAYS }
  );

  const { data: rawCategories } = useCache<ISupportCategory[]>(
    "support_categories",
    async () => {
      return await fetchSupportClientCategories();
    },
    { duration: CACHE_DURATION.CATEGORIES }
  );

  const essays = rawBlogs ?? [];
  const categories = rawCategories ?? [];

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

    // فلترة حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(
        (essay) =>
          (essay.title || essay.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (essay.description || essay.content || "").toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // فلترة حسب التاب
    if (activeTab !== "الكل") {
      filtered = filtered.filter(
        (essay) =>
          essay.category === activeTab ||
          (essay as any).support_category?.name === activeTab ||
          (essay as any).category_name === activeTab
      );
    }

    return filtered;
  }, [searchQuery, activeTab, essays]);

  return (
    <div className="min-h-screen   ">
      <div className="container  max-w-7xl px-4 w-11/12 mx-auto bg-glass rounded-3xl py-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:mb-6 mb-4 py-3">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-right mb-8"
          >
            <h1 className="md:text-2xl text-lg font-bold  mb-3">دليلك لتجربة متجر أفضل</h1>
            <p className="text-lg ">
              محتوى مبني على أفضل ممارسات تجربة المستخدم والتجارة الإلكترونية
            </p>
          </motion.div>
          {/* Search */}
          <div className="relative md:w-80">
            <input
              type="text"
              placeholder="ابحث عن ما يهمك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 pr-12  rounded-full outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
            />
            <BiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" />
          </div>
        </div>
        {/* Search Bar - جنب التابس */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? "gradient-primary text-white shadow-md"
                    : "!text-gray-700 hover:!bg-gray-200 bg-glass"
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
            {filteredEssays.map((essay) => (
              <EssayCard key={essay.id} essay={essay} />
            ))}
          </div>
        )}

        {/* عدد المقالات */}
        {!loading && filteredEssays.length > 0 && (
          <div className="text-center mt-8 text-gray-500">
            عرض {filteredEssays.length} مقال
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
