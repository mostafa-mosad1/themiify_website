/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchBlogDetails, fetchBlogs, IBlog } from "@/lib/api/blogs";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaImage, FaArrowRight } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { stripHtml, cleanAndFormatBlogContent } from "@/lib/utils";

type Essay = IBlog;

const formatArticleDate = (value?: string) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({
  allEssays,
  currentId,
}: {
  allEssays: Essay[];
  currentId: number;
}) {
  const [sidebarSearch, setSidebarSearch] = useState("");

  const recentArticles = allEssays
    .filter((e) => e.id !== currentId)
    .slice(0, 5);

  const searchResults = sidebarSearch.trim()
    ? allEssays.filter(
        (e) =>
          e.id !== currentId &&
          (e.title || e.name || "")
            .toLowerCase()
            .includes(sidebarSearch.toLowerCase()),
      )
    : recentArticles;

  const formatDate = (d?: string) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  return (
    <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:sticky lg:top-6">
      <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:gap-6">
        {/* Search */}
        <div className="rounded-2xl p-4 border border-gray-100 shadow-sm bg-[var(--bg-primary)]">
          <h3 className="font-bold mb-3 text-sm text-[var(--text-primary)]">
            البحث في المقالات
          </h3>
          <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-zinc-800 px-3 py-2 shadow-[inset_1px_4px_8px_rgb(14_19_44_/_6%),inset_-2px_-4px_10px_rgb(255_255_255_/_20%),inset_0_-1px_0px_#0E132C0F] transition-all focus-within:ring-2 focus-within:ring-[var(--primary-color)]/20">
            <BiSearch className="flex-shrink-0 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="ابحث عن مقال..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
            />
          </div>
        </div>

        {/* Recent / Search Results */}
        <div className="rounded-2xl p-4 border border-gray-100 shadow-sm bg-[var(--bg-primary)]">
          <h3 className="font-bold mb-3 text-sm text-[var(--text-primary)]">
            {sidebarSearch.trim() ? "نتائج البحث" : "أحدث المقالات"}
          </h3>
          <div className="flex flex-col gap-3">
            {searchResults.length === 0 ? (
              <p className="text-[var(--text-tertiary)] text-xs text-center py-3">
                لا توجد مقالات أخرى
              </p>
            ) : (
              searchResults.map((essay) => {
                const img = essay.image_url || essay.image;
                const titleText =
                  essay.title || essay.name || "مقال بدون عنوان";
                return (
                  <Link prefetch={false}
                    key={essay.id}
                    href={`/essays/${essay.id}`}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {img &&
                      typeof img === "string" &&
                      !img.includes("[object") ? (
                        <img
                          src={img}
                          alt={titleText}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)]">
                          <FaImage className="text-[var(--text-tertiary)] text-lg" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {titleText}
                      </p>
                      {essay.created_at && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                          {formatDate(essay.created_at)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Related Articles Slider ──────────────────────────────────────────────────
function RelatedArticles({
  allEssays,
  currentId,
}: {
  allEssays: Essay[];
  currentId: number;
}) {
  const related = allEssays.filter((e) => e.id !== currentId);
  const [current, setCurrent] = useState(0);
  const itemsPerSlide = 3;

  // Auto-play functionality
  useEffect(() => {
    if (related.length <= itemsPerSlide) return;

    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % Math.ceil(related.length / itemsPerSlide));
    }, 4000);

    return () => clearInterval(interval);
  }, [related.length, itemsPerSlide]);

  if (related.length === 0) return null;

  const prev = () =>
    setCurrent((c) => (c - 1 + related.length) % related.length);
  const next = () => setCurrent((c) => (c + 1) % related.length);

  const essay = related[current];
  if (!essay) return null;

  const img = essay.image_url || essay.image;
  const titleText = essay.title || essay.name || "مقال بدون عنوان";

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-color)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          مقالات مشابهة
        </h2>
      </div>

      {/* Card */}
      <motion.div
        key={essay.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3 }}
      >
        <div className="group flex flex-col gap-4 md:flex-row-reverse md:items-center border border-[var(--border-color)] rounded-2xl p-3 md:p-4 hover:border-primary/30 hover:shadow-md transition-all bg-[var(--bg-primary)]">
          {/* Content — right side */}
          <div className="flex-1 w-full md:min-w-0 text-right flex flex-col gap-2">
            <h3 className="font-bold text-[var(--text-primary)] group-hover:text-primary transition-colors mb-2 line-clamp-2 leading-snug text-lg">
              {titleText}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
              {stripHtml(essay.description || essay.content || "")}
            </p>
            <Link prefetch={false}
              href={`/essays/${essay.id}`}
              className="text-primary font-medium text-sm hover:underline"
            >
              قراءة المزيد
            </Link>
          </div>

          {/* Thumbnail — left side */}
          <div className="relative w-full md:w-[360px] h-[180px] md:h-[172px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
            {img && typeof img === "string" && !img.includes("[object") ? (
              <Link prefetch={false} href={`/essays/${essay.id}`} className="w-full h-full">
                <img
                  src={img}
                  alt={titleText}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)]">
                <FaImage className="text-[var(--text-tertiary)] text-3xl" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {related.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-full border border-gray-200 hover:border-primary hover:text-primary flex items-center justify-center transition-colors shadow-sm"
            aria-label="السابق"
          >
            <FaArrowRight size={13} />
          </button>
          {/* Dots */}
          <div className="flex gap-1.5 mx-3">
            {related.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-5 h-2 bg-primary"
                    : "w-2 h-2 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-9 h-9 rounded-full border border-gray-200 hover:border-primary hover:text-primary flex items-center justify-center transition-colors shadow-sm rotate-180"
            aria-label="التالي"
          >
            <FaArrowRight size={13} />
          </button>
        </div>
      )}
    </section>
  );
}

export default function EssayDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<Essay[]>([]);
  const [relatedBlogs, setRelatedBlogs] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        const [details, allRes] = await Promise.all([
          fetchBlogDetails(id),
          fetchBlogs({ per_page: 10 }),
        ]);

        const allList = allRes.blogs || [];
        setRecentBlogs(allList);

        if (details.blog) {
          setEssay(details.blog);
          if (details.related_blogs && details.related_blogs.length > 0) {
            setRelatedBlogs(details.related_blogs);
          } else {
            setRelatedBlogs(allList.filter((b) => String(b.id) !== String(id)));
          }
        } else {
          const found = allList.find((b) => String(b.id) === String(id));
          if (found) {
            setEssay(found);
            setRelatedBlogs(allList.filter((b) => String(b.id) !== String(id)));
          } else {
            setNotFound(true);
            setEssay(null);
          }
        }
      } catch {
        setNotFound(true);
        setEssay(null);
        setRecentBlogs([]);
        setRelatedBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="px-4 py-8 animate-pulse max-w-7xl mx-auto">
        <div className="h-8 w-32 bg-gray-200 rounded mb-8" />
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="h-72 w-full bg-gray-200 rounded-2xl mb-6" />
            <div className="h-8 w-2/3 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-5/6 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-4/6 bg-gray-200 rounded" />
          </div>
          <div className="w-72 flex-shrink-0 flex flex-col gap-4">
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !essay) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-2xl font-bold text-[var(--text-secondary)] mb-6">
          المقال غير موجود
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mx-auto text-primary hover:underline"
        >
          <FaArrowRight />
          <span>العودة للمقالات</span>
        </button>
      </div>
    );
  }

  const mainImg = essay.image_url || essay.image;
  const mainTitle = essay.title || essay.name || "مقال بدون عنوان";
  const articleText = cleanAndFormatBlogContent(
    essay.content || essay.description || "",
  );
  const articleSummary = stripHtml(essay.description || essay.content || "");
  const readingMinutes = Math.max(
    1,
    Math.round(
      stripHtml(articleText).split(/\s+/).filter(Boolean).length / 200,
    ),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-7xl mx-auto bg-glass rounded-3xl px-3 py-4 sm:px-4 md:py-6 md:pl-4 md:w-11/12"
    >
      {/* زر الرجوع */}
      <Link prefetch={false}
        href="/essays"
        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-primary transition-colors mb-6 group px-4"
      >
        <FaArrowRight className="group-hover:-translate-x-1 transition-transform" />
        <span>العودة للمقالات</span>
      </Link>

      {/* ─── Hero Image — full width ─── */}
      <div className="relative isolate flex h-[260px] w-full items-center justify-center overflow-hidden rounded-xl bg-gray-900 mb-5 sm:h-[320px] md:mb-8 md:h-[420px] md:rounded-2xl">
        {mainImg &&
        typeof mainImg === "string" &&
        !mainImg.includes("[object") ? (
          <img
            src={mainImg}
            alt={mainTitle}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)]">
            <FaImage className="text-[var(--text-tertiary)] text-6xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/50 to-black/75" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 text-center text-white sm:px-8">
          <h1 className="text-xl font-bold leading-snug drop-shadow-md sm:text-2xl !text-white md:text-4xl">
            {mainTitle}
          </h1>
          {articleSummary && (
            <p className="mt-3 line-clamp-2 max-w-3xl text-center text-xs leading-relaxed text-white/90 drop-shadow sm:text-sm md:text-base">
              {articleSummary}
            </p>
          )}
        </div>
      </div>

      {/* ─── Content + Sidebar side by side ─── */}
      <div className="flex flex-col gap-6 px-0 md:px-4 lg:flex-row lg:items-start lg:gap-8">
        {/* ── Main Content ── */}
        <article className="flex-1 min-w-0 font">
          <div className="mb-5 border-b-2 border-primary pb-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
              {essay.category && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary font-medium">
                  {essay.category}
                </span>
              )}

              {essay.created_at && (
                <span className="flex items-center gap-1.5">
                  <span>📅</span>
                  <span>{formatArticleDate(essay.created_at)}</span>
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <span>⏱</span>
                <span>{readingMinutes} د</span>
              </span>
            </div>
          </div>

          <div
            className="text-base leading-relaxed prose prose-lg max-w-none text-[var(--text-primary)] md:text-lg"
            dangerouslySetInnerHTML={{
              __html: articleText,
            }}
          />
        </article>

        {/* ── Sidebar ── */}
        <Sidebar allEssays={recentBlogs} currentId={essay.id} />
      </div>

      {/* ─── Related Articles — full width ─── */}
      <div className="px-4">
        <RelatedArticles allEssays={relatedBlogs} currentId={essay.id} />
      </div>
    </motion.div>
  );
}
