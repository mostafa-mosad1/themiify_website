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

export async function createSupportCategory(
  data: {
    name: string;
    description?: string;
    icon?: string;
    order_index?: number;
    is_active?: boolean;
  },
  token?: string | null,
): Promise<{ success: boolean; data?: ISupportCategory; error?: string }> {
  try {
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || '',
      icon: data.icon?.trim() || '',
      order_index: data.order_index ?? 1,
      is_active: data.is_active ?? true,
    };
    const res = await apiClient<any>(
      '/admin/support-categories',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    );
    if (res.success) {
      invalidateSupportCategoriesCache();
      const raw = res.data?.data ?? res.data;
      return { success: true, data: raw as ISupportCategory };
    }
    return { success: false, error: res.error || res.message || 'فشل إنشاء التصنيف' };
  } catch (error: any) {
    return { success: false, error: error?.message || 'فشل إنشاء التصنيف' };
  }
}

export async function updateSupportCategory(
  id: number | string,
  data: { name: string },
  token?: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient<any>(
      `/admin/support-categories/${id}`,
      { method: 'PATCH', body: JSON.stringify({ name: data.name.trim() }) },
      token,
    );
    if (res.success) {
      invalidateSupportCategoriesCache();
      return { success: true };
    }
    return { success: false, error: res.error || res.message || 'فشل تعديل التصنيف' };
  } catch (error: any) {
    return { success: false, error: error?.message || 'فشل تعديل التصنيف' };
  }
}

export async function deleteSupportCategory(
  id: number | string,
  token?: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient<any>(
      `/admin/support-categories/${id}`,
      { method: 'DELETE' },
      token,
    );
    if (res.success) {
      invalidateSupportCategoriesCache();
      return { success: true };
    }
    return { success: false, error: res.error || res.message || 'فشل حذف التصنيف' };
  } catch (error: any) {
    return { success: false, error: error?.message || 'فشل حذف التصنيف' };
  }
}
