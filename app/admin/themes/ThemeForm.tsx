/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { MdDone, MdVerticalAlignTop } from "react-icons/md";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import UserGuide from "./steps/UserGuide";
import ThemeData, { ThemeDataRef, ThemeDataProps } from "./steps/ThemeData";
import ThemeIntro, { ThemeIntroProps } from "./steps/Themeintro";
import { Demo } from "@/types/theme.types";
import {
  fetchThemeById,
  createAdminTheme,
  updateAdminTheme,
} from "@/lib/api/themes";
import { fetchPlatforms } from "@/lib/api/platforms";
import { fetchCategories } from "@/lib/api/categories";
import { invalidateCache } from "@/lib/hooks/useCache";

// ─── Safe fetch helper ───────────────────────
// Prevents the cryptic "Unexpected token '<'" error that occurs when the
// server returns an HTML error page (e.g. 413 Too Large, 502 Bad Gateway)
// instead of JSON — which happens when the request body exceeds the platform
// size limit before the route handler even runs.
async function safeJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "(empty response)");
    // Map common HTTP status codes to readable Arabic messages
    if (response.status === 413)
      throw new Error(
        "حجم البيانات كبير جداً — يرجى تقليل المحتوى أو تقسيمه على صفحات",
      );
    if (
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504
    )
      throw new Error("الخادم غير متاح مؤقتاً، يرجى المحاولة مرة أخرى");
    throw new Error(
      `استجابة غير متوقعة من الخادم (${response.status}): ${text.slice(0, 120)}`,
    );
  }
  return response.json();
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Page {
  id: string;
  name: string;
  sections: {
    id: number;
    title: string;
    content: string;
    videoLink?: string;
  }[];
  order?: number;
}

// استخدم نفس النوع بتاع ThemeData مباشرةً عشان ما يحصلش مشكلة في الـ props
type ThemeDataState = ThemeDataProps["step1"];

type ThemeIntroState = ThemeIntroProps["step2"];

// ─────────────────────────────────────────────
// Default states
// ─────────────────────────────────────────────

const defaultThemeData: ThemeDataState = {
  themeName: "",
  themePrice: "",
  platformName: "",
  platformId: null,
  categoryName: "",
  categoryId: null,
  themeImages: [],
  themeImagePreviews: [],
  demos: [],
};

const defaultThemeIntro: ThemeIntroState = {
  introImage: null,
  introImagePreview: "",
  videoLink: "",
  videoTitle: "",
  videoDescription: "",
  platformRank: 1,
  themeRating: 1,
  ratingCount: 0,
  purchaseCount: 0,
  enableRating: true,
  enablePurchase: true,
  buttonTitle: "",
  buyLink: "",
  previewLink: "",
  themeVideoLink: "",
  playlistLink: "",
};

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ThemeFormProps {
  mode: "create" | "edit";
  themeId?: string;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-\u0600-\u06FF]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePage(raw: any, fallbackId: string): Page {
  let sections = Array.isArray(raw?.sections)
    ? raw.sections.map((section: any, index: number) => ({
        id: Number(section?.id) || index + 1,
        title: typeof section?.title === "string" ? section.title : "",
        content: typeof section?.content === "string" ? section.content : "",
        videoLink:
          typeof section?.videoLink === "string"
            ? section.videoLink
            : typeof section?.video_link === "string"
              ? section.video_link
              : "",
      }))
    : [];

  if (sections.length === 0 && typeof raw?.content === "string" && raw.content.trim()) {
    sections = [{
      id: 1,
      title: raw.title || "محتوى",
      content: raw.content,
      videoLink: "",
    }];
  }

  return {
    id:
      typeof raw?.id === "string" && raw.id.trim()
        ? raw.id
        : typeof raw?.slug === "string" && raw.slug.trim()
          ? raw.slug
          : fallbackId,
    name:
      typeof raw?.title === "string" && raw.title.trim()
        ? raw.title
        : typeof raw?.name === "string" && raw.name.trim()
          ? raw.name
        : fallbackId.charAt(0).toUpperCase() + fallbackId.slice(1),
    sections,
  };
}

function parsePagesMap(raw: unknown): { [pageId: string]: Page } {
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      if (raw.trim()) {
        const fallbackId = `page-${Date.now()}`;
        return {
          [fallbackId]: {
            id: fallbackId,
            name: "الرئيسية",
            sections: [{ id: 1, title: "محتوى", content: raw, videoLink: "" }],
          },
        };
      }
      return {};
    }
  }

  const result: { [pageId: string]: Page } = {};

  if (Array.isArray(parsed)) {
    parsed.forEach((item: any, index: number) => {
      const fallbackId = item?.id || item?.slug || `page-${index + 1}`;
      const page = normalizePage(item, fallbackId);
      result[page.id] = page;
    });
    return result;
  }

  if (parsed && typeof parsed === "object") {
    for (const [slugKey, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      const fallbackId = toSlug(slugKey) || slugKey || `page-${Date.now()}`;

      let pageData = value;
      if (typeof value === "string") {
        try {
          pageData = JSON.parse(value);
        } catch {
          pageData = {
            id: fallbackId,
            name: slugKey.charAt(0).toUpperCase() + slugKey.slice(1),
            sections: [
              {
                id: 1,
                title: slugKey.charAt(0).toUpperCase() + slugKey.slice(1),
                content: value,
                videoLink: "",
              },
            ],
          };
        }
      }

      if (
        pageData &&
        typeof pageData === "object" &&
        !Array.isArray(pageData)
      ) {
        const page = normalizePage(pageData, fallbackId);
        result[page.id] = page;
      }
    }
  }

  return result;
}

function buildPagesPayload(pages: { [pageId: string]: Page }): string {
  // Convert to array and sort by order
  const pagesArray = Object.values(pages).sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  const normalizedPages = pagesArray.map((page, index) => {
    const slug = toSlug(page.id || page.name) || `page-${index + 1}`;
    // Combine all sections content into one content string
    const content = Array.isArray(page.sections)
      ? page.sections.map((section) => section.content || "").join("\n")
      : "";

    return {
      title: page.name,
      slug: slug,
      content: content,
      is_default: index === 0, // First page is default
    };
  });

  return JSON.stringify(normalizedPages);
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(
    /(?:^|;\s*)(?:authToken|adminToken|bearer_token)=([^;]+)/,
  );
  return match ? decodeURIComponent(match[1]) : null;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function ThemeForm({ mode, themeId }: ThemeFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserGuideEditing, setIsUserGuideEditing] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>("admin");
  const [userId, setUserId] = useState<string | null>("admin");
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  const [themeData, setThemeData] = useState<ThemeDataState>(defaultThemeData);
  const [themeIntroData, setThemeIntroData] =
    useState<ThemeIntroState>(defaultThemeIntro);
  const [pageData, setPageData] = useState<{ [pageId: string]: Page }>({});

  const themeDataRef = useRef<ThemeDataRef>(null);
  const userGuideRef = useRef<{
    addPendingSections: () => void;
    clearPendingStates: () => void;
    checkPendingSections: () => boolean;
  } | null>(null);

  // ─── Auth + Fetch ───
  useEffect(() => {
    const init = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          setAdminToken(token || "admin");
          setUserId("admin");
        } else {
          setAdminToken(token || "admin");
        }

        // fetch theme if edit mode
        if (mode === "edit" && themeId) {
          const data = await fetchThemeById(themeId, token);
          console.log("Fetched theme data:", data);

          if (data) {
            const item: any = data;
            const bannerUrl =
              item.banner_url || item.banner || item.image_url || "";
            const existingImages =
              Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : bannerUrl
                  ? [bannerUrl]
                  : [];

            setThemeData({
              themeName: item.name || "",
              themePrice: item.price?.toString() || "",
              platformName: item.platform_name || item.platform?.name || "",
              categoryName: item.category_name || item.category?.name || "",
              themeImages: [],
              themeImagePreviews: existingImages,
              demos: (item.theme_demos || item.demos || [])
                .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                .map(
                  (d: any): Demo => ({
                    id: d.id?.toString() || `demo-${Date.now()}`,
                    iconName: d.icon_name ?? null,
                    url: d.url || "",
                    order: d.order ?? 0,
                    imageFile: undefined,
                    imagePreview: d.image_url || undefined,
                  }),
                ),
            });

            setThemeIntroData({
              introImage: null,
              introImagePreview: bannerUrl,
              videoLink: item.video_link || "",
              videoTitle: item.video_title || "",
              videoDescription: item.description || "",
              platformRank: item.platform_rank || 1,
              themeRating: Number(item.rating) || 1,
              ratingCount: item.rating_count || 0,
              purchaseCount: item.purchase_count || 0,
              enableRating: item.rating !== null && item.rating !== undefined,
              enablePurchase:
                item.purchase_count !== null &&
                item.purchase_count !== undefined,
              buttonTitle: item.button_title || "",
              buyLink: item.buy_link || "",
              previewLink: item.inspect_link || item.preview_link || "",
              themeVideoLink: item.video_link || "",
              playlistLink: item.playlist_link || "",
            });

            console.log("Raw pages from API:", item.theme_pages || item.pages);
            console.log("Raw content from API:", item.content);
            const parsedPageData = parsePagesMap(
              item.theme_pages ?? item.pages ?? item.content,
            );
            console.log("Parsed page data:", parsedPageData);
            setPageData(parsedPageData);
            const firstPageId = Object.keys(parsedPageData)[0] || "";
            setActiveTab(firstPageId);
          }
        }
      } catch (err: any) {
        toast.error(`حدث خطأ: ${err.message}`);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    init();
  }, [mode, themeId]);

  // ─── Validate ────────────────────────────────
  const validateData = (): string[] => {
    const errors: string[] = [];
    if (themeDataRef.current) {
      errors.push(...themeDataRef.current.validateStep1());
    } else {
      if (!themeData.themeName.trim()) errors.push("اسم الثيم مطلوب");
      if (!themeData.themePrice.trim()) errors.push("سعر الثيم مطلوب");
      if (!themeData.platformName.trim()) errors.push("المنصة مطلوبة");
      if (!themeData.categoryName.trim()) errors.push("التصنيف مطلوب");
    }
    return errors;
  };

  // ─── Submit ──────────────────────────────────
  const handleSubmit = async () => {
    if (userGuideRef.current) {
      userGuideRef.current.addPendingSections();
    }

    const errors = validateData();
    if (errors.length > 0) {
      toast.error(
        <div>
          <p className="font-bold mb-1">يرجى تصحيح الأخطاء:</p>
          <ul className="list-disc list-inside">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>,
      );
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      mode === "create" ? "جاري إضافة الثيم..." : "جاري حفظ التعديلات...",
    );

    try {
      const token = getAuthToken();

      const existingImageUrls = (themeData.themeImagePreviews || []).filter(
        (p) =>
          p &&
          typeof p === "string" &&
          (p.startsWith("http") || p.startsWith("/")),
      );

      const existingIntroUrl =
        themeIntroData.introImagePreview &&
        typeof themeIntroData.introImagePreview === "string" &&
        (themeIntroData.introImagePreview.startsWith("http") ||
          themeIntroData.introImagePreview.startsWith("/"))
          ? themeIntroData.introImagePreview
          : null;

      const pagesPayload = buildPagesPayload(pageData);
      console.log("Pages payload:", pagesPayload);
      console.log("Parsed pages:", JSON.parse(pagesPayload));

      // Resolve platform_id and category_id if not present
      let pId = themeData.platformId;
      let cId = themeData.categoryId;

      if (!pId || !cId) {
        try {
          const [platsRes, catsRes] = await Promise.all([
            fetchPlatforms(token),
            fetchCategories(token),
          ]);
          if (!pId && themeData.platformName) {
            const foundP = (platsRes.platforms || []).find(
              (p) =>
                p.name.trim().toLowerCase() ===
                themeData.platformName.trim().toLowerCase(),
            );
            if (foundP) pId = foundP.id;
          }
          if (!cId && themeData.categoryName) {
            const foundC = (catsRes.categories || []).find(
              (c) =>
                c.name.trim().toLowerCase() ===
                themeData.categoryName.trim().toLowerCase(),
            );
            if (foundC) cId = foundC.id;
          }
        } catch (err) {
          console.warn(
            "Could not fetch platforms/categories for ID resolution:",
            err,
          );
        }
      }

      // Build FormData with all fields
      const themeFormData = new FormData();
      themeFormData.append("name", themeData.themeName.trim());
      themeFormData.append(
        "price",
        String(parseFloat(themeData.themePrice) || 0),
      );

      if (pId) {
        themeFormData.append("platform_id", String(pId));
      }
      if (cId) {
        themeFormData.append("category_id", String(cId));
      }
      if (themeData.platformName?.trim()) {
        themeFormData.append("platform_name", themeData.platformName.trim());
      }
      if (themeData.categoryName?.trim()) {
        themeFormData.append("category_name", themeData.categoryName.trim());
      }
      if (themeIntroData.videoDescription?.trim()) {
        themeFormData.append(
          "description",
          themeIntroData.videoDescription.trim(),
        );
      }
      if (themeIntroData.previewLink?.trim()) {
        themeFormData.append("inspect_link", themeIntroData.previewLink.trim());
        themeFormData.append("preview_link", themeIntroData.previewLink.trim());
      }
      if (themeIntroData.buyLink?.trim()) {
        themeFormData.append("buy_link", themeIntroData.buyLink.trim());
      }
      if (
        themeIntroData.videoLink?.trim() ||
        themeIntroData.themeVideoLink?.trim()
      ) {
        const vLink =
          themeIntroData.videoLink?.trim() ||
          themeIntroData.themeVideoLink?.trim();
        if (vLink) themeFormData.append("video_link", vLink);
      }
      if (themeIntroData.videoTitle?.trim()) {
        themeFormData.append("video_title", themeIntroData.videoTitle.trim());
      }
      if (themeIntroData.playlistLink?.trim()) {
        themeFormData.append(
          "playlist_link",
          themeIntroData.playlistLink.trim(),
        );
      }
      if (themeIntroData.buttonTitle?.trim()) {
        themeFormData.append("button_title", themeIntroData.buttonTitle.trim());
      }

      // Ranking and Ratings
      themeFormData.append(
        "platform_rank",
        String(themeIntroData.platformRank || 1),
      );

      if (themeIntroData.enableRating) {
        themeFormData.append("rating", String(themeIntroData.themeRating || 5));
        themeFormData.append(
          "rating_count",
          String(themeIntroData.ratingCount || 0),
        );
      }
      if (themeIntroData.enablePurchase) {
        themeFormData.append(
          "purchase_count",
          String(themeIntroData.purchaseCount || 0),
        );
      }

      // ─── Banner / Main Theme Image (API expects the file in the "banner_url" attribute) ───
      const bannerFile =
        themeIntroData.introImage ||
        (themeData.themeImages && themeData.themeImages.length > 0
          ? themeData.themeImages[0]
          : null);

      // Only append banner_url if a new File was selected.
      // Backend validates: 'banner_url' => 'file|image|mimes:jpeg,png,jpg,webp' and rejects string URLs.
      if (
        bannerFile &&
        typeof bannerFile === "object" &&
        "name" in bannerFile
      ) {
        themeFormData.append("banner_url", bannerFile);
      }

      const additionalImageFiles = (themeData.themeImages || []).filter(
        (file) => file !== bannerFile,
      );
      if (additionalImageFiles.length > 0) {
        additionalImageFiles.forEach((file) => {
          themeFormData.append("images[]", file);
        });
      }
      if (existingImageUrls.length > 0) {
        existingImageUrls.forEach((url: string) => {
          themeFormData.append("existing_images[]", url);
        });
        themeFormData.append("images", JSON.stringify(existingImageUrls));
        if (!themeData.themeImages?.length) {
          themeFormData.append("image_url", existingImageUrls[0]);
        }
      }

      // Demos
      if (themeData.demos && themeData.demos.length > 0) {
        themeFormData.append("demos", JSON.stringify(themeData.demos));
        themeFormData.append("theme_demos", JSON.stringify(themeData.demos));
      }

      // User Guide / Pages
      const parsedPages = JSON.parse(pagesPayload);
      parsedPages.forEach((page: any, index: number) => {
        themeFormData.append(`theme_pages[${index}][title]`, page.title);
        themeFormData.append(`theme_pages[${index}][slug]`, page.slug);
        themeFormData.append(`theme_pages[${index}][content]`, page.content);
        themeFormData.append(
          `theme_pages[${index}][default]`,
          page.is_default ? "1" : "0",
        );
      });
      themeFormData.append("content", pagesPayload);

      // Bearer token in formData if required by backend
      if (token) {
        themeFormData.append("bearer_token", token);
      }

      // Log FormData for debugging
      console.log("Sending FormData to API:");
      for (const [key, value] of themeFormData.entries()) {
        console.log(`${key}:`, value);
      }

      const res =
        mode === "create"
          ? await createAdminTheme(themeFormData, token)
          : await updateAdminTheme(themeId!, themeFormData, token);

      if (res.success) {
        // Clear cached themes from localStorage
        if (typeof window !== "undefined") {
          try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const k = localStorage.key(i);
              if (
                k &&
                (k.startsWith("cache_themes") || k.startsWith("admin_themes"))
              ) {
                localStorage.removeItem(k);
              }
            }
            window.dispatchEvent(
              new CustomEvent("data-mutated", { detail: { type: "all" } })
            );
          } catch (e) {
            console.warn("Could not clear themes cache:", e);
          }
        }

        invalidateCache("admin_themes");
        invalidateCache("themes");

        toast.success(
          mode === "create"
            ? "✅ تم إضافة الثيم بنجاح!"
            : "✅ تم تعديل الثيم بنجاح!",
          { id: toastId },
        );

        if (userGuideRef.current) {
          userGuideRef.current.clearPendingStates();
        }

        router.push("/admin/themes");
        router.refresh();
      } else {
        toast.error(res.error || "حدث خطأ أثناء حفظ الثيم", { id: toastId });
      }
    } catch (error: any) {
      toast.error(`❌ فشل الإرسال: ${error.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Validate before moving to next step ─────
  const validateBeforeNext = (): boolean => {
    if (currentStep === 1) {
      const errors: string[] = themeDataRef.current
        ? themeDataRef.current.validateStep1()
        : ([
            !themeData.themeName.trim() && "اسم الثيم مطلوب",
            !themeData.themePrice.trim() && "سعر الثيم مطلوب",
            !themeData.platformName.trim() && "المنصة مطلوبة",
            !themeData.categoryName.trim() && "التصنيف مطلوب",
          ].filter(Boolean) as string[]);

      if (errors.length > 0) {
        toast.error(
          <div>
            <p className="font-semibold mb-1">يرجى إكمال البيانات المطلوبة:</p>
            <ul className="list-disc list-inside">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>,
        );
        return false;
      }
    }

    return true;
  };

  // ─── Steps config ────────────────────────────
  const steps = [
    {
      id: 1,
      label: "بيانات الثيم",
      component: (
        <ThemeData
          ref={themeDataRef}
          step1={themeData}
          updateStep1={(data) => {
            setThemeData((prev) => ({ ...prev, ...data }));
            if (data.themeImages && data.themeImages.length > 0) {
              setThemeIntroData((prev) => ({
                ...prev,
                introImage: data.themeImages![0],
                introImagePreview:
                  data.themeImagePreviews?.[0] || prev.introImagePreview,
              }));
            }
          }}
        />
      ),
    },
    {
      id: 2,
      label: "تعريف الثيم",
      component: (
        <ThemeIntro
          step2={themeIntroData}
          updateStep2={(data: Partial<ThemeIntroState>) =>
            setThemeIntroData((prev) => ({ ...prev, ...data }))
          }
        />
      ),
    },
    {
      id: 3,
      label: "دليل المستخدم",
      component: (
        <UserGuide
          ref={userGuideRef}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pageData={pageData}
          updatePageData={setPageData}
          onEditingStateChange={setIsUserGuideEditing}
        />
      ),
    },
  ];

  // ─── Loading ─────────────────────────────────
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // ─── No auth ──────────────────────────────────
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-glass flex items-center justify-center">
        <div className="text-center bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] p-8 rounded-2xl max-w-md">
          <p className="text-xl font-bold mb-2">يجب تسجيل الدخول أولاً</p>
          <p className="text-[var(--text-secondary)] mb-6">ليس لديك صلاحية</p>
          <Link
            href="/login"
            className="inline-block bg-[var(--primary-color)] text-[var(--bg-primary)] px-6 py-3 rounded-lg hover:opacity-80 transition-opacity"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }



  // ─── Main render ──────────────────────────────
  return (
    <div
      className="min-h-screen bg-glass border-[var(--bg-primary)] p-8 rounded-2xl"
      dir="rtl"
    >
      {/* Header + Progress */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="text-[var(--text-primary)]"
          >
            <FaArrowRight size={14} />
          </button>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {mode === "create" ? "إضافة ثيم جديد" : "تعديل الثيم"}
          </h1>
        </div>

        <div className="relative flex items-center justify-between mb-12">
          <div className="absolute top-3 right-[60px] w-[90%] h-4 bg-transparent shadow-[inset_2px_3px_10px_0px_var(--border-color)]">
            <div
              className="h-full bg-[var(--primary-color)] transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col items-center justify-center gap-1 relative z-10 w-32"
            >
              <button
                onClick={() => setCurrentStep(step.id)}
                className="flex items-center justify-center w-10 h-10 bg-[var(--bg-primary)] p-2 rounded-full shadow-[inset_2px_5px_10px_0px_var(--text-tertiary)]"
              >
                {currentStep > step.id ? (
                  <span className="bg-[var(--primary-color)] text-[var(--bg-primary)] rounded-full flex items-center justify-center w-full h-full">
                    ✓
                  </span>
                ) : currentStep === step.id ? (
                  <span className="relative w-full h-full bg-[var(--primary-color)] rounded-full after:content-[''] after:absolute after:w-4 after:h-4 after:bg-[var(--bg-primary)] after:rounded-full after:top-1 after:left-1" />
                ) : (
                  <span className="w-full h-full bg-[var(--border-color)] rounded-full" />
                )}
              </button>
              <span className="text-base font-bold text-[var(--text-primary)]">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="shadow-sm">{steps[currentStep - 1]?.component}</div>

      {/* Navigation */}
      <div className="mt-14 flex items-center justify-center gap-4  bg-[white] h-[70px] p-4 rounded-full bottom-[13px] sticky z-10 mx-auto w-fit">
        <MdVerticalAlignTop
          size={28}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="cursor-pointer z-20"
        />
        <button
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep === 1}
          className="flex items-center justify-center gap-2 bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold text-base h-full w-[110px] shadow-sm shadow-[var(--text-primary)]
            hover:bg-gradient-to-r hover:from-[var(--bg-primary)]/10 hover:via-[var(--text-tertiary)]/10 hover:to-[var(--bg-primary)]/10
            disabled:bg-gradient-to-r disabled:from-[var(--text-tertiary)]/20 disabled:via-[var(--bg-primary)]/20 disabled:to-[var(--text-tertiary)]/20
            disabled:text-[var(--text-primary)] rounded-full transition"
        >
          <FaArrowRight size={12} /> السابق
        </button>

        <div className="flex items-center gap-2 border border-[var(--border-color)] opacity-50 bg-[var(--bg-primary)]/20 rounded-full shadow-[inset_3px_2px_2px_0px_var(--bg-primary)] px-6 py-1">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => {
                if (step.id > currentStep) {
                  if (validateBeforeNext()) setCurrentStep(step.id);
                } else {
                  setCurrentStep(step.id);
                }
              }}
              className={`flex items-center justify-center rounded-full transition-all duration-200 ${
                currentStep === step.id
                  ? "w-7 h-7 bg-[var(--primary-color)] text-[var(--bg-primary)] text-xs font-bold"
                  : "w-7 h-7 hover:bg-[var(--bg-tertiary)]"
              }`}
            >
              {step.id}
            </button>
          ))}
        </div>

        {mode === "edit" ? (
          !isUserGuideEditing && (
            <button
              onClick={handleSubmit}
              className="relative flex items-center gap-2 justify-center text-base font-semibold bg-[var(--text-primary)] text-[var(--bg-primary)] h-10 px-2 rounded-full hover:text-[var(--primary-color)] duration-300 transition-colors z-10"
            >
              {isSubmitting ? (
                <>
                  <span className="w-full px-2 rounded-full h-full flex items-center justify-center">
                    جاري الحفظ...
                  </span>
                  <div className="w-[1.2rem] h-4 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                <span className="flex items-center justify-center gap-2 relative z-20 bg-gradient-to-r from-[var(--bg-primary)]/20 via-[var(--text-primary)] to-[var(--bg-primary)]/20 w-full px-2 rounded-full h-full transition-all duration-300">
                  حفظ التعديلات
                  <MdDone size={18} />
                </span>
              )}
            </button>
          )
        ) : currentStep === steps.length ? (
          !isUserGuideEditing && (
            <button
              onClick={handleSubmit}
              className="relative flex items-center gap-2 justify-center text-base font-semibold bg-[var(--text-primary)] text-[var(--bg-primary)] h-10 px-2 rounded-full hover:text-[var(--primary-color)] duration-300 transition-colors z-10"
            >
              {isSubmitting ? (
                <>
                  <span className="w-full px-2 rounded-full h-full flex items-center justify-center">
                    جاري الحفظ...
                  </span>
                  <div className="w-[1.2rem] h-4 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                <span className="flex items-center justify-center gap-2 relative z-20 bg-gradient-to-r from-[var(--bg-primary)]/20 via-[var(--text-primary)] to-[var(--bg-primary)]/20 w-full px-2 rounded-full h-full transition-all duration-300">
                  حفظ الثيم
                  <MdDone size={18} />
                </span>
              )}
            </button>
          )
        ) : (
          <button
            onClick={() => {
              if (validateBeforeNext())
                setCurrentStep((s) => Math.min(steps.length, s + 1));
            }}
            className="relative flex items-center gap-2 justify-center text-base font-semibold bg-[var(--text-primary)] text-[var(--bg-primary)] h-10 w-28 rounded-full transition-colors z-10"
          >
            <span className="flex items-center justify-center gap-2 relative z-20 bg-gradient-to-r from-[var(--bg-primary)]/20 via-[var(--text-primary)] to-[var(--bg-primary)]/20 w-full rounded-full h-full transition-all duration-300">
              التالي <FaArrowLeft size={12} />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
