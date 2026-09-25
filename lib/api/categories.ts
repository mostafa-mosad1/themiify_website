// lib/api/categories.ts
import { apiClient } from "./config";

export interface ICategory {
  id: number;
  name: string;
  theme_name?: string | null;
  image?: string | null;
  image_url?: string | null;
  color?: string | null;
  icon?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function normalizeCategory(raw: any): ICategory | null {
  if (!raw) return null;
  const item =
    raw.category && typeof raw.category === "object"
      ? raw.category
      : raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)
        ? raw.data
        : raw;

  if (!item || typeof item !== "object" || Array.isArray(item)) return null;

  const rawImage = item.image_url || item.image;
  const cleanImage =
    typeof rawImage === "string" && !rawImage.includes("[object") && rawImage.trim() !== ""
      ? rawImage.trim()
      : null;

  return {
    id: Number(item.id) || 0,
    name: item.name || item.title || "",
    theme_name: item.theme_name || item.theme || null,
    image: cleanImage,
    image_url: cleanImage,
    color: item.color || null,
    icon: item.icon || null,
    description: item.description || null,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at,
  };
}

export interface IPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

// In-memory cache for public client categories
let cachedCategories: { data: ICategory[]; timestamp: number } | null = null;
let pendingCategoriesPromise: Promise<{ categories: ICategory[] }> | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export function clearCategoriesCache() {
  cachedCategories = null;
  pendingCategoriesPromise = null;
}

/**
 * جلب الأقسام للواجهة العامة والفلاتر عبر /categories الخفيفة والسريعة بدون token
 */
export async function fetchClientCategories(forceRefresh = false): Promise<{ categories: ICategory[] }> {
  try {
    if (!forceRefresh && cachedCategories && Date.now() - cachedCategories.timestamp < CACHE_TTL_MS) {
      return { categories: cachedCategories.data };
    }

    if (pendingCategoriesPromise) {
      return await pendingCategoriesPromise;
    }

    pendingCategoriesPromise = (async () => {
      try {
        const res = await apiClient<any>("/categories", { skipAuth: true, silent: true });
        if (res.success && res.data) {
          let rawList: any[] = [];
          if (Array.isArray(res.data)) {
            rawList = res.data;
          } else if (res.data.data && Array.isArray(res.data.data)) {
            rawList = res.data.data;
          } else if (Array.isArray(res.data.categories)) {
            rawList = res.data.categories;
          }

          const categories = rawList
            .map((item) => normalizeCategory(item)!)
            .filter(Boolean);

          const uniqueCategories = Array.from(
            new Map(categories.map((c) => [c.id || c.name, c])).values()
          );

          cachedCategories = { data: uniqueCategories, timestamp: Date.now() };
          return { categories: uniqueCategories };
        }
        return { categories: [] };
      } finally {
        pendingCategoriesPromise = null;
      }
    })();

    return await pendingCategoriesPromise;
  } catch (error) {
    console.error("❌ Error fetching client categories:", error);
    return { categories: [] };
  }
}

/**
 * دالة جلب جميع الأقسام (تستخدم /categories الخفيفة كافتراضي)
 */
export async function fetchAllCategories(): Promise<{ categories: ICategory[] }> {
  return await fetchClientCategories();
}

/**
 * جلب الأقسام: إذا تم تمرير رقم صفحة معين يجلب تلك الصفحة من /admin/categories، وإلا يجلب /categories الخفيفة السريعة
 */
export async function fetchCategories(
  token?: string | null,
  page?: number | "all"
): Promise<{ categories: ICategory[]; pagination?: IPaginationMeta }> {
  try {
    // إذا تم تحديد رقم صفحة معين (صفحة إدارة الأقسام في لوحة التحكم)
    if (typeof page === "number") {
      const res = await apiClient<any>(`/admin/categories?page=${page}`, {}, token);
      if (res.success && res.data) {
        let rawList: any[] = [];
        let pagination: IPaginationMeta | undefined = undefined;

        if (Array.isArray(res.data)) {
          rawList = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          rawList = res.data.data;
          pagination = {
            current_page: Number(res.data.current_page) || page,
            last_page: Number(res.data.last_page) || 1,
            per_page: Number(res.data.per_page) || 15,
            total: Number(res.data.total) || rawList.length,
            from: res.data.from,
            to: res.data.to,
          };
        } else if (Array.isArray(res.data.categories)) {
          rawList = res.data.categories;
        }

        const categories = rawList.map((item) => normalizeCategory(item)!).filter(Boolean);
        return { categories, pagination };
      }
      return { categories: [] };
    }

    // لجميع الفلاتر والقوائم المنسدلة والموقع: استخدام /categories العامة الخفيفة بدون token
    return await fetchClientCategories();
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return await fetchClientCategories();
  }
}

export async function createCategory(
  formData: FormData | { name: string; icon?: string },
  token?: string | null
): Promise<{ success: boolean; data?: ICategory; error?: string }> {
  try {
    let name = "";
    let icon = "";

    if (typeof FormData !== "undefined" && formData instanceof FormData) {
      name = (formData.get("name") as string) || "";
      icon = (formData.get("icon") as string) || "";
    } else if (formData && typeof formData === "object") {
      name = (formData as any).name || "";
      icon = (formData as any).icon || "";
    }

    const payload: { name: string; icon?: string } = {
      name: name.trim(),
    };
    if (icon) {
      payload.icon = icon.trim();
    }

    let res = await apiClient<ICategory>(
      "/admin/categories",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );

    // Fallback: If JSON failed and we have FormData, try sending FormData
    if (!res.success && typeof FormData !== "undefined" && formData instanceof FormData) {
      const fdRes = await apiClient<ICategory>(
        "/admin/categories",
        {
          method: "POST",
          body: formData,
        },
        token
      );
      if (fdRes.success) {
        clearCategoriesCache();
        return fdRes;
      }
    }

    if (res.success) {
      clearCategoriesCache();
    }
    return { success: res.success, data: res.data, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل إنشاء القسم" };
  }
}

export async function updateCategory(
  id: string | number,
  formData: FormData | { name: string; icon?: string },
  token?: string | null
): Promise<{ success: boolean; data?: ICategory; error?: string }> {
  try {
    let name = "";
    let icon = "";

    if (typeof FormData !== "undefined" && formData instanceof FormData) {
      name = (formData.get("name") as string) || "";
      icon = (formData.get("icon") as string) || "";
    } else if (formData && typeof formData === "object") {
      name = (formData as any).name || "";
      icon = (formData as any).icon || "";
    }

    const payload: { name: string; icon?: string } = {
      name: name.trim(),
    };
    if (icon) {
      payload.icon = icon.trim();
    }

    let res = await apiClient<ICategory>(
      `/admin/categories/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    );

    if (!res.success) {
      // Fallback 1: POST with _method PATCH and JSON
      res = await apiClient<ICategory>(
        `/admin/categories/${id}`,
        {
          method: "POST",
          body: JSON.stringify({ ...payload, _method: "PATCH" }),
        },
        token
      );
    }

    if (!res.success && typeof FormData !== "undefined" && formData instanceof FormData) {
      // Fallback 2: FormData POST
      formData.set("_method", "PATCH");
      const fdRes = await apiClient<ICategory>(
        `/admin/categories/${id}`,
        {
          method: "POST",
          body: formData,
        },
        token
      );
      if (fdRes.success) {
        clearCategoriesCache();
        return fdRes;
      }
    }

    if (res.success) {
      clearCategoriesCache();
    }
    return { success: res.success, data: res.data, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل تعديل القسم" };
  }
}

export async function deleteCategory(
  id: string | number,
  token?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient<void>(`/admin/categories/${id}`, { method: "DELETE" }, token);
    if (res.success) {
      clearCategoriesCache();
    }
    return { success: res.success, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل حذف القسم" };
  }
}
