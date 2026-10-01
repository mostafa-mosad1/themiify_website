// app/(client)/themes/[id]/page.tsx
import React from "react";
import Button from "@/components/ui/Button";
import { FaArrowRight, FaStar } from "react-icons/fa6";
import Link from "next/link";
import ThemeGrid from "./Themegrid";
import ThemeCard from "@/components/ui/ThemeCard";
import { fetchThemeById } from "@/lib/api/themes";

interface StructuredSection {
  id: number;
  title: string;
  content: string;
  videoLink: string;
}

interface StructuredPage {
  slug: string;
  name: string;
  sections: StructuredSection[];
}

function normalizeContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .join("\n");
  }
  if (content && typeof content === "object") {
    return JSON.stringify(content);
  }
  return "";
}

function parseThemePages(raw: unknown, themeFallback?: any): StructuredPage[] {
  if (!raw && !themeFallback) return [];

  let data = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      data = [
        {
          slug: "home",
          name: "الرئيسية",
          sections: [
            {
              id: 1,
              title: "الرئيسية",
              content: raw,
              videoLink: "",
            },
          ],
        },
      ];
    }
  }

  let result: StructuredPage[] = [];

  if (Array.isArray(data)) {
    result = data
      .map((item: any, pageIdx: number) => {
        // Case 1: item has sub_content array
        if (Array.isArray(item?.sub_content)) {
          const pageTitle =
            item.page_title || item.title || item.name || `صفحة ${pageIdx + 1}`;
          const sections: StructuredSection[] = item.sub_content.map(
            (sub: any, sIdx: number) => ({
              id: Number(sub?.id) || sIdx + 1,
              title: sub?.title || sub?.name || `قسم ${sIdx + 1}`,
              content: normalizeContent(sub?.content),
              videoLink:
                sub?.video_link || sub?.videoLink || sub?.video_url || "",
            })
          );

          return {
            slug: item.slug || `page-${pageIdx + 1}`,
            name: pageTitle,
            sections,
          };
        }

        // Case 2: item has sections array
        if (Array.isArray(item?.sections)) {
          const pageTitle =
            item.name || item.title || item.page_title || `صفحة ${pageIdx + 1}`;
          const sections: StructuredSection[] = item.sections.map(
            (sec: any, sIdx: number) => ({
              id: Number(sec?.id) || sIdx + 1,
              title: sec?.title || sec?.name || `قسم ${sIdx + 1}`,
              content: normalizeContent(sec?.content),
              videoLink:
                sec?.video_link || sec?.videoLink || sec?.video_url || "",
            })
          );

          return {
            slug: item.slug || `page-${pageIdx + 1}`,
            name: pageTitle,
            sections,
          };
        }

        // Case 3: item is a page section itself or has content string/JSON
        const pageTitle =
          item.page_title ||
          item.title ||
          item.name ||
          item.slug ||
          `صفحة ${pageIdx + 1}`;
        const rawContent = item.content ?? item.sub_content ?? item.body;
        const normalized = normalizeContent(rawContent);

        try {
          const inner = JSON.parse(normalized);
          if (inner && typeof inner === "object" && Array.isArray(inner.sections)) {
            return {
              slug: item.slug || `page-${pageIdx + 1}`,
              name: inner.name || pageTitle,
              sections: inner.sections.map((sec: any, sIdx: number) => ({
                id: Number(sec?.id) || sIdx + 1,
                title: sec?.title || sec?.name || `قسم ${sIdx + 1}`,
                content: normalizeContent(sec?.content),
                videoLink:
                  sec?.video_link || sec?.videoLink || sec?.video_url || "",
              })),
            };
          }
        } catch {
          // ignore
        }

        return {
          slug: item.slug || `page-${pageIdx + 1}`,
          name: pageTitle,
          sections: [
            {
              id: Number(item.id) || pageIdx + 1,
              title: pageTitle,
              content: normalized,
              videoLink: item.video_link || item.videoLink || "",
            },
          ],
        };
      })
      .filter((p) => p.sections.length > 0);
  } else if (typeof data === "object" && data !== null) {
    result = Object.entries(data as Record<string, unknown>).map(
      ([slug, val], pageIdx) => {
        const normalized = normalizeContent(val);
        try {
          const parsed = JSON.parse(normalized);
          if (
            parsed &&
            typeof parsed === "object" &&
            Array.isArray(parsed.sections)
          ) {
            return {
              slug,
              name: parsed.name || slug,
              sections: parsed.sections.map((sec: any, sIdx: number) => ({
                id: Number(sec?.id) || sIdx + 1,
                title: sec?.title || `قسم ${sIdx + 1}`,
                content: normalizeContent(sec?.content),
                videoLink: sec?.video_link || sec?.videoLink || "",
              })),
            };
          }
        } catch {
          // ignore
        }

        return {
          slug,
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          sections: [
            {
              id: pageIdx + 1,
              title: slug.charAt(0).toUpperCase() + slug.slice(1),
              content: normalized,
              videoLink: "",
            },
          ],
        };
      }
    );
  }

  // Fallback if result is empty but theme has description or video
  if (result.length === 0 && themeFallback) {
    result.push({
      slug: "overview",
      name: "تعريف الثيم",
      sections: [
        {
          id: 1,
          title: "فيديو تعريفي",
          content: `<p>خلّي الثيم يعكس هوية البراند بتاعتك بسهولة.</p>
<p>من هنا تقدر تعدّل الألوان، الخطوط، والمسافات بحيث يطلع الشكل النهائي متناسق، واضح، ومتوافق مع دليل الهوية بتاعك—من غير ما تكسر التجربة أو تأثر على الاستخدام.</p>
<p>تخصيص الثيم مش مجرد تغيير ألوان أو اختيار خط شكله حلو؛ هو خطوة أساسية علشان تخلي تجربة الاستخدام متناسقة مع هوية البراند، ومفهومة، وسهلة للمستخدمين في كل نقطة تفاعل. من خلال إعدادات التخصيص، تقدر تتحكم في شكل ومظهر الداشبورد بالكامل—من الألوان الأساسية، للخطوط، للمسافات—مع الحفاظ على تجربة استخدام ثابتة ومريحة.</p>
<p>الفكرة الأساسية هنا إن أي تعديل بتعمله بيكون محسوب، مش عشوائي. المستخدم مش بيشوف الواجهة كعناصر منفصلة، هو بيشوف صورة كاملة، ودماغه دايماً بيدور على الاتساق.</p>`,
          videoLink: themeFallback.video_link || themeFallback.playlist_link || "",
        },
        {
          id: 2,
          title: "وصف",
          content: themeFallback.description
            ? `<p>${themeFallback.description}</p>`
            : `<p>شرح تفصيلي حول استخدام ومميزات الثيم وطريقة تطبيقه على متجرك.</p>`,
          videoLink: "",
        },
        {
          id: 3,
          title: "مميزات الثيم",
          content: `<p>يتميز الثيم بسرعة فائقة في التصفح، تجربة مستخدم مصممة لزيادة معدل التحويل، وتوافق تام مع كافة الهواتف والأجهزة اللوحية.</p>`,
          videoLink: "",
        },
        {
          id: 4,
          title: "كيف تستخدم الثيم",
          content: `<p>خطوات تفعيل وتخصيص الثيم عبر لوحة التحكم بكل سهولة ودون الحاجة لأي خبرة برمجية مسبقة.</p>`,
          videoLink: "",
        },
      ],
    });
  }

  return result;
}

function getYoutubeId(url?: string | null) {
  if (!url) return "";
  if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
  if (url.includes("embed/")) return url.split("embed/")[1].split("?")[0];
  return "";
}

const PLATFORM_LOGOS: Record<string, string> = {
  salla: "https://cdn.salla.network/images/logo/logo.svg",
  sharry: "https://dev.gosharry.com/themes/gosharrytheme/build/assets/logo_admin-0f8bf526.png",
  shopify: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
  woocommerce: "https://cdn.worldvectorlogo.com/logos/woocommerce.svg",
  zid: "/images/logo_zid.svg",
};

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

  const rawPages =
    (theme as any)?.theme_pages ??
    (theme as any)?.pages ??
    (theme as any)?.content;

  const structuredPages = parseThemePages(rawPages, theme);

  const platformName = theme.platform?.name || theme.platform_name || "Salla";
  const platformLogo =
    theme.platform?.icon || PLATFORM_LOGOS[platformName.toLowerCase()];
  const introVideoUrl = theme.video_link || theme.playlist_link || "";

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
    <div className="w-11/12 mx-auto my-6 space-y-8" dir="rtl">
      {/* ── Top Bar: Back button ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/themes"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--primary-color)] transition-colors group"
        >
          <span className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/10 group-hover:border-[var(--primary-color)]/50 transition-colors shadow-sm">
            <FaArrowRight size={12} />
          </span>
          <span>الرجوع إلى الثيمات</span>
        </Link>
      </div>

      {/* ── Top Hero Card: Banner + Intro Video & Info ──────────────────── */}
      <div className="bg-white dark:bg-card-dark rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
        {/* Slim Banner Header */}
        <div className="w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 max-h-[160px] md:max-h-[180px] flex items-center justify-center">
          <img
            src={theme.banner_url || mediaUrls[0] || "/images/placeholder.svg"}
            alt={theme.name}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Intro Video & Info Row */}
        <div className="flex flex-col-reverse lg:flex-row-reverse items-center gap-8 pt-2">
          {/* Right Info (in RTL): Title, Description, Metadata, Button */}
          <div className="w-full lg:w-1/2 space-y-4 text-right">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              فيديو تعريفي لثيم {theme.name}
            </h1>
            <p className="text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-300 font-normal">
              {theme.description ||
                `مع ثيم ${theme.name}، تقدر تطلق متجرك على ${platformName} بشكل احترافي في وقت قياسي. تصميم مرن، سرعة تحميل عالية، وتجربة مستخدم محسوبة خطوة بخطوة... علشان عميلك يوصل للمنتج ويشتري من غير ما يفكر كتير`}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                {platformLogo ? (
                  <img
                    src={platformLogo}
                    alt={platformName}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs">
                    🛍
                  </span>
                )}
                <span>رقم #{theme.platform_rank || 1} على منصة {platformName}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>({theme.rating_count || 80} تقييم)</span>
                <div className="flex items-center text-[#FFC62A]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FaStar
                      key={index}
                      size={14}
                      className={
                        index < Math.round(Number(theme.rating) || 5)
                          ? "fill-current"
                          : "opacity-30"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={introVideoUrl || "#"}
                target={introVideoUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-[#F26B21] to-[#FF8C38] text-white font-bold text-sm md:text-base shadow-[0_4px_14px_rgba(242,107,33,0.35)] hover:opacity-95 hover:scale-[1.02] transition-all cursor-pointer"
              >
                شاهد الفيديو الآن
              </a>
            </div>
          </div>

          {/* Left Video Mockup (in RTL) */}
          <div className="w-full lg:w-1/2">
            <div className="relative mx-auto w-full max-w-xl group">
              {/* Laptop Display Bezel */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                  {introVideoUrl ? (
                    <iframe
                      src={
                        getYoutubeId(introVideoUrl)
                          ? `https://www.youtube.com/embed/${getYoutubeId(introVideoUrl)}`
                          : introVideoUrl
                      }
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <img
                      src={theme.banner_url || mediaUrls[0] || "/images/placeholder.svg"}
                      alt={theme.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Theme Grid Sections / User Guide Content ────────────────────── */}
      {structuredPages.length > 0 && (
        <div>
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