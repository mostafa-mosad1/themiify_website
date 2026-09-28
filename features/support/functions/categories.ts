import { apiClient } from "@/lib/api/config";
import type { ISupportCategory } from "../types";
export type { ISupportCategory };

interface ApiResponse<T> {
  status?: boolean;
  message?: string;
  data?: T;
}

// In-memory cache
let cachedSupportCategories: ISupportCategory[] | null = null;
let lastFetchTime = 0;
let inflightPromise: Promise<ISupportCategory[]> | null = null;
const CACHE_TTL_MS = 60 * 1000;

export function invalidateSupportCategoriesCache(): void {
  cachedSupportCategories = null;
  lastFetchTime = 0;
  inflightPromise = null;
}

export async function fetchAdminSupportCategories(
  token?: string | null,
): Promise<ISupportCategory[]> {
  const now = Date.now();
  if (cachedSupportCategories && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedSupportCategories;
  }
  if (inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = (async () => {
    try {
      const res = await apiClient<unknown>(
        "/admin/support-categories",
        {},
        token,
      );

    if (res.success && res.data !== undefined) {
      let rawList: unknown[] = [];

      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (
        typeof res.data === "object" &&
        res.data !== null &&
        "data" in res.data &&
        Array.isArray((res.data as Record<string, unknown>).data)
      ) {
        rawList = (res.data as Record<string, unknown>).data as unknown[];
      }

      const result = rawList
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const rec = item as Record<string, unknown>;
          return {
            id: Number(rec.id) || 0,
            name: String(rec.name || "").trim(),
            description: rec.description ? String(rec.description) : null,
            icon: rec.icon ? String(rec.icon) : null,
            question_count:
              typeof rec.question_count === "number" ? rec.question_count : 0,
            order_index:
              typeof rec.order_index === "number" ? rec.order_index : 0,
            is_active: rec.is_active !== false,
          } as ISupportCategory;
        })
        .filter(
          (cat): cat is ISupportCategory => Boolean(cat && cat.id && cat.name),
        )
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      cachedSupportCategories = result;
      lastFetchTime = Date.now();
      return result;
    }

    return [];
  } catch (error) {
    console.error("❌ Error fetching support categories:", error);
    return [];
  } finally {
    inflightPromise = null;
  }
  })();

  return inflightPromise;
}

/**
 * جلب فئات الدعم للواجهة العامة (العميل) عبر /support/category
 */
export async function fetchSupportClientCategories(): Promise<ISupportCategory[]> {
  try {
    const res = await apiClient<unknown>("/support/category", { skipAuth: true, silent: true });
    if (res.success && res.data !== undefined) {
      let rawList: unknown[] = [];

      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (
        typeof res.data === "object" &&
        res.data !== null &&
        "data" in res.data &&
        Array.isArray((res.data as Record<string, unknown>).data)
      ) {
        rawList = (res.data as Record<string, unknown>).data as unknown[];
      }

      const list = rawList
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const rec = item as Record<string, unknown>;
          return {
            id: Number(rec.id) || 0,
            name: String(rec.name || "").trim(),
            description: rec.description ? String(rec.description) : null,
            icon: rec.icon ? String(rec.icon) : null,
            question_count:
              typeof rec.question_count === "number" ? rec.question_count : 0,
            order_index:
              typeof rec.order_index === "number" ? rec.order_index : 0,
            is_active: rec.is_active !== false,
            questions: Array.isArray(rec.questions) ? rec.questions : [],
            blogs: Array.isArray(rec.blogs) ? rec.blogs : [],
          } as ISupportCategory;
        })
        .filter(
          (cat): cat is ISupportCategory => Boolean(cat && cat.id && cat.name),
        )
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      if (list.length > 0) return list;
    }

    return await fetchAdminSupportCategories();
  } catch (error) {
    console.error("❌ Error fetching client support categories:", error);
    return [];
  }
}
