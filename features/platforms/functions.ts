import { apiClient } from "@/lib/api/config";
import type { IPlatform, IPaginationMeta } from "./types";
export type { IPlatform, IPaginationMeta };

export function normalizePlatform(raw: any): IPlatform | null {
  if (!raw) return null;
  const item =
    raw.platform && typeof raw.platform === "object"
      ? raw.platform
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
    image: cleanImage,
    image_url: cleanImage,
    icon: item.icon || null,
    description: item.description || null,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at,
  };
}

// In-memory cache for public client platforms
let cachedPlatforms: { data: IPlatform[]; timestamp: number } | null = null;
let pendingPlatformsPromise: Promise<{ platforms: IPlatform[] }> | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export function clearPlatformsCache() {
  cachedPlatforms = null;
  pendingPlatformsPromise = null;
}

/**
 * جلب المنصات للواجهة العامة والفلاتر عبر /platforms الخفيفة والسريعة بدون token
 */
export async function fetchClientPlatforms(forceRefresh = false): Promise<{ platforms: IPlatform[] }> {
  try {
    if (!forceRefresh && cachedPlatforms && Date.now() - cachedPlatforms.timestamp < CACHE_TTL_MS) {
      return { platforms: cachedPlatforms.data };
    }

    if (pendingPlatformsPromise) {
      return await pendingPlatformsPromise;
    }

    pendingPlatformsPromise = (async () => {
      try {
        const res = await apiClient<any>("/platforms", { skipAuth: true, silent: true });
        if (res.success && res.data) {
          let rawList: any[] = [];
          if (Array.isArray(res.data)) {
            rawList = res.data;
          } else if (res.data.data && Array.isArray(res.data.data)) {
            rawList = res.data.data;
          } else if (Array.isArray(res.data.platforms)) {
            rawList = res.data.platforms;
          }

          const platforms = rawList
            .map((item) => normalizePlatform(item)!)
            .filter(Boolean);

          const uniquePlatforms = Array.from(
            new Map(platforms.map((p) => [p.id || p.name, p])).values()
          );

          cachedPlatforms = { data: uniquePlatforms, timestamp: Date.now() };
          return { platforms: uniquePlatforms };
        }
        return { platforms: [] };
      } finally {
        pendingPlatformsPromise = null;
      }
    })();

    return await pendingPlatformsPromise;
  } catch (error) {
    console.error("❌ Error fetching client platforms:", error);
    return { platforms: [] };
  }
}

/**
 * دالة جلب جميع المنصات (تستخدم /platforms الخفيفة كافتراضي)
 */
export async function fetchAllPlatforms(): Promise<{ platforms: IPlatform[] }> {
  return await fetchClientPlatforms();
}

/**
 * جلب المنصات: إذا تم تمرير رقم صفحة معين يجلب تلك الصفحة من /admin/platforms، وإلا يجلب /platforms الخفيفة السريعة
 */
export async function fetchPlatforms(
  token?: string | null,
  page?: number | "all"
): Promise<{ platforms: IPlatform[]; pagination?: IPaginationMeta }> {
  try {
    // إذا تم تحديد رقم صفحة معين (صفحة إدارة المنصات في لوحة التحكم)
    if (typeof page === "number") {
      const res = await apiClient<any>(`/admin/platforms?page=${page}`, {}, token);
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
        } else if (Array.isArray(res.data.platforms)) {
          rawList = res.data.platforms;
        }

        const platforms = rawList.map((item) => normalizePlatform(item)!).filter(Boolean);
        return { platforms, pagination };
      }
      return { platforms: [] };
    }

    // لجميع الفلاتر والقوائم المنسدلة والموقع: استخدام /platforms العامة الخفيفة بدون token
    return await fetchClientPlatforms();
  } catch (error) {
    console.error("❌ Error fetching platforms:", error);
    return await fetchClientPlatforms();
  }
}

export async function fetchPlatformById(
  id: string | number,
  token?: string | null
): Promise<IPlatform | null> {
  try {
    const res = await apiClient<any>(`/admin/platforms/${id}`, {}, token);
    if (res.success && res.data) {
      return normalizePlatform(res.data);
    }
    return null;
  } catch (error) {
    console.error(`❌ Error fetching platform ${id}:`, error);
    return null;
  }
}

export async function createPlatform(
  data: FormData | { name: string },
  token?: string | null
): Promise<{ success: boolean; data?: IPlatform; error?: string }> {
  try {
    const name =
      data instanceof FormData
        ? (data.get("name") as string) || ""
        : typeof data === "object" && data !== null
          ? (data as any).name || ""
          : "";

    const payload = { name: name.trim() };

    const res = await apiClient<IPlatform>(
      "/admin/platforms",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );

    if (!res.success && data instanceof FormData) {
      const fdRes = await apiClient<IPlatform>(
        "/admin/platforms",
        {
          method: "POST",
          body: data,
        },
        token
      );
      if (fdRes.success) {
        clearPlatformsCache();
        return fdRes;
      }
    }

    if (res.success) {
      clearPlatformsCache();
    }

    return { success: res.success, data: res.data, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل إنشاء المنصة" };
  }
}

export async function updatePlatform(
  id: string | number,
  data: FormData | { name: string },
  token?: string | null
): Promise<{ success: boolean; data?: IPlatform; error?: string }> {
  try {
    const name =
      data instanceof FormData
        ? (data.get("name") as string) || ""
        : typeof data === "object" && data !== null
          ? (data as any).name || ""
          : "";

    const payload = { name: name.trim() };

    // 1. PATCH with JSON body { "name": "..." }
    const res = await apiClient<IPlatform>(
      `/admin/platforms/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    );

    if (!res.success) {
      // 2. Fallback: PUT with JSON body
      const putRes = await apiClient<IPlatform>(
        `/admin/platforms/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
        token
      );
      if (putRes.success) {
        clearPlatformsCache();
        return putRes;
      }

      // 3. Fallback: POST with _method=PATCH (JSON)
      const postJsonRes = await apiClient<IPlatform>(
        `/admin/platforms/${id}`,
        {
          method: "POST",
          body: JSON.stringify({ ...payload, _method: "PATCH" }),
        },
        token
      );
      if (postJsonRes.success) {
        clearPlatformsCache();
        return postJsonRes;
      }

      // 4. Fallback: FormData with _method=PATCH
      if (data instanceof FormData) {
        data.set("_method", "PATCH");
        const postRes = await apiClient<IPlatform>(
          `/admin/platforms/${id}`,
          {
            method: "POST",
            body: data,
          },
          token
        );
        if (postRes.success) {
          clearPlatformsCache();
        }
        return { success: postRes.success, data: postRes.data, error: postRes.error };
      }
    }

    if (res.success) {
      clearPlatformsCache();
    }

    return { success: res.success, data: res.data, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل تعديل المنصة" };
  }
}

export async function deletePlatform(
  id: string | number,
  token?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient<void>(`/admin/platforms/${id}`, { method: "DELETE" }, token);
    if (res.success) {
      clearPlatformsCache();
    }
    return { success: res.success, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل حذف المنصة" };
  }
}
