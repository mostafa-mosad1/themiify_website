// app/(client)/themes/[id]/page.tsx
import React from "react";
import Button from "@/components/ui/Button";
import { FaArrowRight, FaStar } from "react-icons/fa6";
import Link from "next/link";
import ThemeGrid from "./Themegrid";
import ThemeCard from "@/components/ui/ThemeCard";
import { fetchThemeById } from "@/lib/api/themes";

function parseThemePagesMap(raw: unknown): Record<string, string> {
  if (!raw) return {};

  if (Array.isArray(raw)) {
    const result: Record<string, string> = {};
    for (const page of raw as any[]) {
      const slug = String(
        page?.title || page?.name || page?.slug || page?.id || "page",
      );
      result[slug] = typeof page?.content === "string" ? page.content : JSON.stringify(page);
    }
    return result;
  }

  if (typeof raw === "object" && raw !== null) {
    return Object.fromEntries(
      Object.entries(raw as Record<string, unknown>).map(([slug, content]) => [
        slug,
        typeof content === "string" ? content : JSON.stringify(content ?? ""),
      ]),
    );
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const result: Record<string, string> = {};
        for (const page of parsed as any[]) {
          const slug = String(
            page?.title || page?.name || page?.slug || page?.id || "page",
          );
          result[slug] = typeof page?.content === "string" ? page.content : JSON.stringify(page);
        }
        return result;
      }
      if (parsed && typeof parsed === "object") {
        return Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>).map(([slug, content]) => [
            slug,
            typeof content === "string" ? content : JSON.stringify(content ?? ""),
          ]),
        );
      }
    } catch {
      return { home: raw };
    }

    return { home: raw };
  }

  return {};
}

function parsePageContent(slug: string, rawContent: unknown) {
  const content = typeof rawContent === "string" ? rawContent : String(rawContent ?? "");

  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const sections = Array.isArray((parsed as any).sections)
        ? (parsed as any).sections.map((section: any, index: number) => ({
            id: Number(section?.id) || index + 1,
            title: typeof section?.title === "string" ? section.title : `Section ${index + 1}`,
            content: typeof section?.content === "string" ? section.content : "",
            videoLink:
              typeof section?.videoLink === "string"
                ? section.videoLink
                : typeof section?.video_link === "string"
                  ? section.video_link
                  : "",
          }))
        : [];

      return {
        name:
          typeof (parsed as any).name === "string" && (parsed as any).name.trim()
            ? (parsed as any).name
            : slug.charAt(0).toUpperCase() + slug.slice(1),
        sections,
      };
    }
  } catch {
    // Fallback
  }

  return {
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    sections: content.trim()
      ? [
          {
            id: 1,
            title: slug.charAt(0).toUpperCase() + slug.slice(1),
            content,
            videoLink: "",
          },
        ]
      : [],
  };
}

function getYoutubeId(url?: string | null) {
  if (!url) return "";
  if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
  if (url.includes("embed/")) return url.split("embed/")[1].split("?")[0];
  return "";
}

// ─── Page component ───────────────────────────────────────────────────────────
const ThemeDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const theme = await fetchThemeById(id);

  if (!theme) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-glass rounded-2xl mx-4 my-8" dir="rtl">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          الثيم غير موجود
        </h2>
        <p className="text-gray-500 mb-6">لم يتم العثور على هذا الثيم برقم #{id}.</p>
        <Link href="/themes">
          <Button variant="primary">العودة للثيمات</Button>
        </Link>
      </div>
    );
  }

  const rawPages = (theme as any)?.theme_pages ?? (theme as any)?.pages ?? (theme as any)?.content;
  const parsedPagesMap = parseThemePagesMap(rawPages);
  const pages = Object.entries(parsedPagesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slug, content], index) => ({
      id: index + 1,
      theme_id: theme.id || id,
      slug,
      content,
    }));

  const structuredPages = pages
    .map((page: any) => ({
      slug: page.slug,
      ...parsePageContent(page.slug, page.content),
    }))
    .filter((page: any) => page.sections.length > 0);

  const platformName = theme.platform?.name || theme.platform_name || "Salla";

  const rawImages = (theme as any).images;
  const mediaUrls: string[] = [];

  if (Array.isArray(rawImages)) {
    mediaUrls.push(...rawImages);
  } else if (typeof rawImages === "object" && rawImages !== null) {
    if (Array.isArray(rawImages.main_images))
      mediaUrls.push(...rawImages.main_images);
    if (Array.isArray(rawImages.previews)) mediaUrls.push(...rawImages.previews);
  } else if (typeof rawImages === "string") {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) mediaUrls.push(...parsed);
      else if (typeof parsed === "object" && parsed !== null) {
        if (Array.isArray(parsed.main_images))
          mediaUrls.push(...parsed.main_images);
        if (Array.isArray(parsed.previews))
          mediaUrls.push(...parsed.previews);
      }
    } catch {
      if (rawImages.trim()) mediaUrls.push(rawImages);
    }
  }

  if (theme.image_url && !mediaUrls.includes(theme.image_url)) {
    mediaUrls.unshift(theme.image_url);
  }
  if (theme.banner_url && !mediaUrls.includes(theme.banner_url)) {
    mediaUrls.unshift(theme.banner_url);
  }

  return (
    <div className="w-11/12 mx-auto my-6 space-y-6" dir="rtl">
      {/* ── Top Bar: Back button ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/themes"
          className="inline-flex items-center gap-2 text-sm font-medium text-black dark:text-white hover:text-primary transition-colors group"
        >
          <span className="p-2 rounded-xl bg-glass border border-white/40 dark:border-white/10 group-hover:border-primary/50 transition-colors shadow-sm">
            <FaArrowRight size={12} />
          </span>
          <span>الرجوع إلى الثيمات</span>
        </Link>
      </div>

      {/* ── Theme Banner ───────────────────────────────────────────────── */}
      <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 rounded-3xl overflow-hidden">
        <img
          src={theme.banner_url || mediaUrls[0] || "/images/placeholder.svg"}
          alt={theme.name}
          className="w-full h-auto max-h-[420px] object-cover rounded-2xl"
        />
      </div>

      {theme.video_link || theme.playlist_link ? (
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-4 md:p-5">
          <div className="flex flex-col md:flex-row items-center gap-5">
            <a
              href={theme.video_link || theme.playlist_link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-full md:w-[48%] aspect-video rounded-2xl overflow-hidden bg-black group"
            >
              <img
                src={
                  getYoutubeId(theme.video_link || theme.playlist_link)
                    ? `https://i.ytimg.com/vi/${getYoutubeId(theme.video_link || theme.playlist_link)}/hqdefault.jpg`
                    : theme.banner_url || "/images/placeholder.svg"
                }
                alt={`فيديو تعريفي عن ${theme.name}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl text-2xl pl-1">
                  ▶
                </span>
              </span>
            </a>
            <div className="w-full md:w-[52%] text-right space-y-3">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                فيديو تعريفي لثيم {theme.name}
              </h2>
              <p className="text-sm md:text-base leading-7 text-[var(--text-secondary)]">
                {theme.description ||
                  `مع ثيم ${theme.name} تقدر تطلق متجرك بشكل احترافي في وقت قياسي. تصميم مرن، سرعة تحميل عالية، وتجربة مستخدم محسوبة خطوة بخطوة.`}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-[var(--text-primary)] font-semibold">
                  رقم #{theme.platform_rank || 1} على منصة {platformName}
                </span>
                <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                  <span>({theme.rating_count || 0} تقييم)</span>
                  <span className="flex items-center text-[#FFC62A]" aria-label={`تقييم ${theme.rating || 0} من 5`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <FaStar key={index} size={13} className={index < Math.round(Number(theme.rating) || 0) ? "" : "opacity-25"} />
                    ))}
                  </span>
                </span>
              </div>
              <a
                href={theme.video_link || theme.playlist_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-orange-500 px-5 py-2.5 font-bold text-white hover:bg-orange-600 transition-colors"
              >
                مشاهدة الفيديو الآن
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Theme Grid Sections / Pages Content ─────────────────────────── */}
      {structuredPages.length > 0 && (
        <div className="mt-10">
          <ThemeGrid
            pages={structuredPages}
            theme={theme}
            platformName={(theme as any)?.platform_name || (theme as any)?.platform?.name || ""}
          />
        </div>
      )}

      {/* ── Related Themes Section ─────────────────────────────────────── */}
      {Array.isArray(theme.related_themes) && theme.related_themes.length > 0 && (
        <div className="mt-14 space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              ثيمات ذات صلة
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {theme.related_themes.map((relatedItem) => (
              <ThemeCard
                key={relatedItem.id}
                id={relatedItem.id}
                name={relatedItem.name}
                imageUrl={relatedItem.banner_url || relatedItem.image_url || "/images/placeholder.svg"}
                price={relatedItem.price || "0"}
                categoryName={relatedItem.category?.name || relatedItem.category_name || ""}
                platformName={relatedItem.platform?.name || relatedItem.platform_name || ""}
                userGuideUrl={`/themes/${relatedItem.id}`}
                previewLink={relatedItem.inspect_link || undefined}
                buyLink={relatedItem.buy_link || undefined}
                playlistLink={relatedItem.playlist_link || undefined}
                youtubeLink={relatedItem.video_link || undefined}
                demos={relatedItem.demos || []}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeDetailPage;