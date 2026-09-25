import React from "react";
import Button from "@/components/ui/Button";
import { FaArrowRight, FaCartShopping, FaStar } from "react-icons/fa6";
import { FaEdit, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import Link from "next/link";
import ThemeMediaSlider from "./ThemeMediaSlider";
import ThemeGrid from "./Themegrid";
import { fetchThemeById } from "@/lib/api/themes";

// ─── Same parsePageContent as client page ────────────────────────────────────
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
    // Fallback to plain HTML content below.
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

const ThemeDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  let theme: any = null;
  let error: Error | null = null;
  let rawPages: any[] | null = null;

  try {
    const themeResult = await fetchThemeById(id);
    theme = themeResult;
    rawPages = (themeResult as any)?.theme_pages || (themeResult as any)?.pages || [];

    if (!theme) {
      error = new Error("Theme not found");
    }
  } catch (err) {
    error = err as Error;
  }

  // Parse pages exactly like the client page does
  const pages: any[] = rawPages && Array.isArray(rawPages)
    ? rawPages.map((page) => {
        const normalized = parsePageContent(page.slug, page.content);
        return {
          id: page.id,
          slug: page.slug,
          content: page.content,
          name: normalized.name,
          sections: normalized.sections,
        };
      })
    : [];

  const platformLogos: Record<string, string> = {
    shopify: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
    woocommerce: "https://cdn.worldvectorlogo.com/logos/woocommerce.svg",
    bigcommerce: "https://cdn.worldvectorlogo.com/logos/bigcommerce-1.svg",
    salla: "https://cdn.salla.network/images/logo/logo.svg",
    zid: "/images/logo_zid.svg",
    wordprees: "/logos/wordprees.svg",
  };

  if (error || !theme) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-light)]">
          <p className="text-red-500 text-xl font-bold mb-4">
            حدث خطأ في تحميل بيانات الثيم
          </p>
          <p className="text-[var(--text-secondary)] mb-6">
            {error?.message || "لم يتم العثور على الثيم المطلوب"}
          </p>
          <Button url="/themes" icon={<FaArrowRight />} iconPosition="right">
            <span>العودة لجميع الثيمات</span>
          </Button>
        </div>
      </section>
    );
  }

  const rating = parseFloat(theme.rating) || 5.0;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const platformKey = theme.platform_name?.toLowerCase();
  const logoUrl = platformLogos[platformKey];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-[14px] flex items-center justify-between">
        <nav className="flex items-center gap-2 text-base text-[var(--text-secondary)]">
          <Link
            href="/admin/themes"
            className="hover:text-[var(--primary-color)] transition-colors"
          >
            جميع الثيمات
          </Link>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-bold text-2xl">
             ثيم {theme.name}
          </span>
        </nav>

        <Link
          href={`/admin/themes/edit/${theme.id}`}
          className="relative flex items-center gap-2 justify-center text-base font-semibold bg-[var(--text-primary)] text-[var(--bg-primary)] h-10 w-28 rounded-full hover:text-[var(--primary-color)] transition-colors z-10"
        >
          <span className="flex items-center justify-center gap-2 relative z-20 bg-gradient-to-r from-white/20 via-[var(--text-primary)] to-white/20 w-full rounded-full h-full transition-all duration-300">
            <FaEdit size={18} />
            <span>تعديل</span>
          </span>
        </Link>
      </div>

      {/* البانر والفيديو */}
      <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 rounded-3xl flex items-center justify-center flex-col gap-6">
        {(theme.banner || theme.banner_url) && (
          <div className="w-full  rounded-2xl overflow-hidden">
            <img
              src={theme.banner || theme.banner_url}
              alt={theme.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-center gap-5 w-full h-full">
          <div className="w-[45%] h-[260px]">
            <ThemeMediaSlider theme={theme} />
          </div>

          <div className="w-[55%] h-full flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-[var(--text-primary)] leading-tight">
              ثيم {theme.name}
            </h1>
            <p className="text-base font-normal text-[var(--text-secondary)] mb-2 leading-6">
              {theme.description}
            </p>

            <div className="flex items-center gap-2 justify-between mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="p-2 rounded-full"
                  style={{
                    boxShadow: "0px 4px 6px 0px rgba(14, 19, 44, 0.06) inset",
                    background: "var(--glass-bg)",
                  }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={theme.platform_name}
                      className="h-4 w-auto object-cover"
                    />
                  ) : (
                    <span className="text-[var(--text-primary)]">{theme.platform_name}</span>
                  )}
                </span>
                <span className="text-base font-semibold tracking-wider text-[var(--text-primary)]">
                  {theme.platform_name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    if (i < fullStars)
                      return <FaStar key={i} size={13} className="text-[#FFC62A]" />;
                    if (i === fullStars && hasHalf)
                      return <FaStarHalfAlt key={i} size={13} className="text-[#FFC62A]" />;
                    return <FaRegStar key={i} size={13} className="text-[var(--text-tertiary)]" />;
                  })}
                </div>
                {(theme.reviews_count ?? 100) > 0 && (
                  <span className="text-[var(--text-tertiary)] font-normal text-xs">
                    ( {theme.reviews_count ?? 100} تقييم )
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-4 ">

              <Button
                url={theme.video_link}
                className="activeCart text-sm font-bold bg-[var(--bg-secondary)] justify-center border-none shadow-none w-[50%]"
                icon={<FaCartShopping />}
                openInNewTab
              >
                <span>شاهد الفيديو الآن</span>
              </Button>

              <Button
                variant="solid"
                url={theme.buy_link}
                openInNewTab={!!theme.buy_link}
                className="flex items-center justify-center text-primary buyCardBtn w-1/2"
                aria-label="شراء المنتج الآن"
              >
                <span className="text-primary">اشتري الآن</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid - PagesTabs + PagesDropdown + YoutubeChannelCard */}
      <ThemeGrid
        pages={pages}
        platformName={theme.platform_name}
        theme={theme}
      />
    </main>
  );
};

export default ThemeDetailPage;