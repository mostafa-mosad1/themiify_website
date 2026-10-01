/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiClient } from "@/lib/api/config";
import type { ITheme, IThemesPagination } from "./types";

export async function fetchThemes(params?: {
  page?: number;
  per_page?: number;
  category_id?: number | string;
  platform_id?: number | string;
  search?: string;
}): Promise<{ themes: ITheme[]; pagination?: IThemesPagination }> {
  try {
    const query = new URLSearchParams();
    if (params?.per_page) query.append("per_page", String(params.per_page));
    if (params?.page) query.append("page", String(params.page));
    if (params?.category_id)
      query.append("category_id", String(params.category_id));
    if (params?.platform_id)
      query.append("platform_id", String(params.platform_id));
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient<
      IThemesPagination | ITheme[] | { data: ITheme[] }
    >(`/themes${queryString}`);

    if (res.success && res.data) {
      let rawList: ITheme[] = [];
      let pagination: IThemesPagination | undefined = undefined;

      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (Array.isArray((res.data as any).data)) {
        rawList = (res.data as any).data;
        pagination = res.data as any;
      } else if (Array.isArray((res.data as any).themes)) {
        rawList = (res.data as any).themes;
        pagination = res.data as any;
      }

      const themes = rawList.map((t: any) => ({
        ...t,
        demos: t.demos || t.theme_demos || [],
      }));
      return { themes, pagination };
    }
    return { themes: [] };
  } catch (error) {
    console.error("❌ Error fetching themes:", error);
    return { themes: [] };
  }
}

export async function fetchThemeById(
  id: string | number,
  token?: string | null,
): Promise<ITheme | null> {
  try {
    const rawId = String(id).trim();
    const decodedId = decodeURIComponent(rawId);

    const endpoint = token
      ? `/admin/themes/${encodeURIComponent(rawId)}`
      : `/themes/${encodeURIComponent(rawId)}`;
    const res = await apiClient<any>(
      endpoint,
      { silent: true, forceRefresh: true },
      token,
    );

    if (res.success && res.data) {
      if (res.data.theme && typeof res.data.theme === "object") {
        return {
          ...res.data.theme,
          related_themes: Array.isArray(res.data.related_themes)
            ? res.data.related_themes
            : [],
        } as ITheme;
      }
      if (
        res.data.data &&
        typeof res.data.data === "object" &&
        !Array.isArray(res.data.data)
      ) {
        const themeObj = res.data.data.theme || res.data.data;
        return {
          ...themeObj,
          related_themes: Array.isArray(res.data.data.related_themes)
            ? res.data.data.related_themes
            : Array.isArray(res.data.related_themes)
              ? res.data.related_themes
              : [],
        } as ITheme;
      }
      if (res.data.id) {
        return res.data as ITheme;
      }
    }

    const fallbackEndpoint = token
      ? `/themes/${encodeURIComponent(rawId)}`
      : `/admin/themes/${encodeURIComponent(rawId)}`;
    const fallbackRes = await apiClient<any>(
      fallbackEndpoint,
      { silent: true, forceRefresh: true },
      token,
    );
    if (fallbackRes.success && fallbackRes.data) {
      if (
        fallbackRes.data.theme &&
        typeof fallbackRes.data.theme === "object"
      ) {
        return {
          ...fallbackRes.data.theme,
          related_themes: Array.isArray(fallbackRes.data.related_themes)
            ? fallbackRes.data.related_themes
            : [],
        } as ITheme;
      }
      if (
        fallbackRes.data.data &&
        typeof fallbackRes.data.data === "object" &&
        !Array.isArray(fallbackRes.data.data)
      ) {
        const themeObj = fallbackRes.data.data.theme || fallbackRes.data.data;
        return {
          ...themeObj,
          related_themes: Array.isArray(fallbackRes.data.data.related_themes)
            ? fallbackRes.data.data.related_themes
            : Array.isArray(fallbackRes.data.related_themes)
              ? fallbackRes.data.related_themes
              : [],
        } as ITheme;
      }
      if (fallbackRes.data.id) {
        return fallbackRes.data as ITheme;
      }
    }

    const listRes = await fetchThemes({ per_page: 100 });
    const found = listRes.themes.find(
      (t) =>
        String(t.id) === rawId ||
        String(t.id) === decodedId ||
        (t.name && t.name.trim().toLowerCase() === decodedId.toLowerCase()) ||
        (t.name && encodeURIComponent(t.name.trim()) === rawId),
    );
    if (found && String(found.id) !== rawId) {
      return await fetchThemeById(found.id, token);
    }
    return found || null;
  } catch (error) {
    console.error(`❌ Error fetching theme [${id}]:`, error);
    return null;
  }
}

export async function fetchAdminThemes(
  token?: string | null,
  params?: {
    page?: number;
    per_page?: number;
    category_id?: number | string;
    platform_id?: number | string;
    search?: string;
  },
): Promise<{ themes: ITheme[]; pagination?: IThemesPagination }> {
  try {
    const query = new URLSearchParams();
    if (params?.per_page) query.append("per_page", String(params.per_page));
    if (params?.page) query.append("page", String(params.page));
    if (params?.category_id)
      query.append("category_id", String(params.category_id));
    if (params?.platform_id)
      query.append("platform_id", String(params.platform_id));
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient<
      IThemesPagination | ITheme[] | { data: ITheme[] }
    >(`/admin/themes${queryString}`, {}, token);
    if (res.success && res.data) {
      let rawList: ITheme[] = [];
      let pagination: IThemesPagination | undefined = undefined;

      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (Array.isArray((res.data as any).data)) {
        rawList = (res.data as any).data;
        pagination = res.data as any;
      } else if (Array.isArray((res.data as any).themes)) {
        rawList = (res.data as any).themes;
        pagination = res.data as any;
      }

      const themes = rawList.map((t: any) => ({
        ...t,
        demos: t.demos || t.theme_demos || [],
      }));
      return { themes, pagination };
    }
    const fallback = await fetchThemes(params);
    return fallback;
  } catch (error) {
    console.error("❌ Error fetching admin themes:", error);
    const fallback = await fetchThemes(params);
    return fallback;
  }
}

export async function createAdminTheme(
  formData: FormData,
  token?: string | null,
): Promise<{
  success: boolean;
  data?: ITheme;
  error?: string;
  message?: string;
}> {
  try {
    const res = await apiClient<ITheme>(
      "/admin/themes",
      {
        method: "POST",
        body: formData,
      },
      token,
    );

    return {
      success: res.success,
      data: res.data,
      error: res.error || (res.success ? undefined : res.message),
      message: res.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "فشل إنشاء الثيم",
    };
  }
}

export async function updateAdminTheme(
  id: string | number,
  formData: FormData,
  token?: string | null,
): Promise<{
  success: boolean;
  data?: ITheme;
  error?: string;
  message?: string;
}> {
  try {
    if (!formData.has("_method")) {
      formData.append("_method", "PATCH");
    }

    const postRes = await apiClient<ITheme>(
      `/admin/themes/${id}`,
      {
        method: "POST",
        body: formData,
      },
      token,
    );

    if (postRes.success) {
      return {
        success: true,
        data: postRes.data,
        error: undefined,
        message: postRes.message,
      };
    }

    const patchRes = await apiClient<ITheme>(
      `/admin/themes/${id}`,
      {
        method: "PATCH",
        body: formData,
      },
      token,
    );

    return {
      success: patchRes.success,
      data: patchRes.data,
      error:
        patchRes.error || (patchRes.success ? undefined : patchRes.message),
      message: patchRes.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "فشل تعديل الثيم",
    };
  }
}

export async function deleteAdminTheme(
  id: string | number,
  token?: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient<void>(
      `/admin/themes/${id}`,
      {
        method: "DELETE",
      },
      token,
    );

    return {
      success: res.success,
      error: res.error,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "فشل حذف الثيم",
    };
  }
}
