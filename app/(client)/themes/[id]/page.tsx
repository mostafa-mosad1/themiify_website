// app/(client)/themes/[id]/page.tsx
import React from "react";
import Button from "@/components/ui/Button";
import { FaArrowRight, FaCartShopping, FaStar } from "react-icons/fa6";
import { FaStarHalfAlt, FaRegStar, FaYoutube } from "react-icons/fa";
import Link from "next/link";
import ThemeMediaSlider from "./ThemeMediaSlider";
import ThemeGrid from "./Themegrid";
import ThemeCard from "@/components/ui/ThemeCard";
import { BsEye } from "react-icons/bs";
import { fetchThemeById, ITheme } from "@/lib/api/themes";

function parseThemePagesMap(raw: unknown): Record<string, string> {
  if (!raw) return {};

  if (Array.isArray(raw)) {
    const result: Record<string, string> = {};
    for (const page of raw as any[]) {
      const slug = String(page?.slug || page?.id || page?.name || "page");
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
          const slug = String(page?.slug || page?.id || page?.name || "page");
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

// ─── Platform logo map ────────────────────────────────────────────────────────
const PLATFORM_LOGOS: Record<string, string> = {
  shopify: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
  woocommerce: "https://cdn.worldvectorlogo.com/logos/woocommerce.svg",
  bigcommerce: "https://cdn.worldvectorlogo.com/logos/bigcommerce-1.svg",
  salla: "https://cdn.salla.network/images/logo/logo.svg",
  zid: "/images/logo_zid.svg",
  wordpress: "/logos/wordpress.svg",
};

// ─── Star rating helper ───────────────────────────────────────────────────────
function StarRating({
  rating,
  reviewsCount,
}: {
  rating: number;
  reviewsCount?: number;
}) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars)
            return <FaStar key={i} size={13} className="text-[#FFC62A]" />;
          if (i === fullStars && hasHalf)
            return (
              <FaStarHalfAlt key={i} size={13} className="text-[#FFC62A]" />
            );
          return (
            <FaRegStar key={i} size={13} className="text-[var(--text-tertiary)]" />
          );
        })}
      </div>
      {(reviewsCount ?? 0) > 0 && (
        <span className="text-[var(--text-tertiary)] font-normal text-xs">
          ( {reviewsCount}+ تقييم )
        </span>
      )}
    </div>
  );
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

  const rating = Number(theme.rating) || 5;
  const ratingCount = theme.rating_count || 0;
  const platformName = theme.platform?.name || theme.platform_name || "Salla";
  const platformKey = platformName.toLowerCase();
  const platformLogo = PLATFORM_LOGOS[platformKey] || PLATFORM_LOGOS.salla;

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

      {/* ── Main Hero Card ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/60 dark:border-white/10 bg-glass shadow-xl p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Right Column: Theme Info */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20">
                  {theme.category?.name || theme.category_name || "ثيم مميز"}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-secondary)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={platformLogo}
                    alt={platformName}
                    className="w-4 h-4 object-contain"
                  />
                  <span>{platformName}</span>
                </span>

                <StarRating rating={rating} reviewsCount={ratingCount} />
              </div>

              {/* Theme Name */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">
                {theme.name}
              </h1>

              {/* Description */}
              {theme.description && (
                <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed line-clamp-4">
                  {theme.description}
                </p>
              )}

              {/* Pricing */}
              {theme.price && (
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-3xl md:text-4xl font-black text-primary">
                    {theme.price}
                  </span>
                  <span className="text-sm font-semibold text-[var(--text-tertiary)]">
                    ريال سعودي
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              {theme.buy_link && (
                <Button
                  url={theme.buy_link}
                  openInNewTab
                  variant="primary"
                  className="px-6 py-3 text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  <FaCartShopping size={14} />
                  <span>شراء الثيم الآن</span>
                </Button>
              )}

              {theme.inspect_link && (
                <Button
                  url={theme.inspect_link}
                  openInNewTab
                  variant="secondary"
                  className="px-6 py-3 text-sm font-semibold flex items-center gap-2 bg-white/60 dark:bg-white/10 hover:bg-white/90 text-black dark:text-white border border-black/10 dark:border-white/10"
                >
                  <BsEye size={16} />
                  <span>معاينة حية</span>
                </Button>
              )}

              {theme.video_link && (
                <a
                  href={theme.video_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-100 transition-colors"
                >
                  <FaYoutube size={16} />
                  <span>شرح الفيديو</span>
                </a>
              )}
            </div>
          </div>

          {/* Left Column: Media Gallery Slider */}
          <div className="lg:col-span-5 w-full">
            <ThemeMediaSlider theme={theme} mediaUrls={mediaUrls} themeName={theme.name} />
          </div>
        </div>
      </div>

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