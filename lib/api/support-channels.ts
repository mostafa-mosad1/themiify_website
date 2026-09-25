// lib/api/support-channels.ts
import { apiClient } from "./config";

export interface ISupportChannel {
  id: number;
  name: string;
  name_ar?: string | null;
  type?: string | null;
  value: string;
  icon?: string | null;
  order_index?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function normalizeSupportChannel(raw: any): ISupportChannel | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw.channel || raw.data || raw;
  if (!item || typeof item !== "object") return null;

  return {
    id: Number(item.id) || 0,
    name: item.name || item.title || "",
    name_ar: item.name_ar || item.title_ar || null,
    type: item.type || "text",
    value: item.value || "",
    icon: item.icon || null,
    order_index: typeof item.order_index === "number" ? item.order_index : Number(item.order_index) || 0,
    is_active: item.is_active === true || item.is_active === 1 || item.is_active === "1",
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

/**
 * جلب قنوات الدعم للوحة الإدارة
 */
export async function fetchAdminSupportChannels(
  token?: string | null
): Promise<{ channels: ISupportChannel[] }> {
  try {
    const res = await apiClient<any>("/admin/support-channels", {}, token);
    if (res.success && res.data) {
      let rawList: any[] = [];
      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        rawList = res.data.data;
      } else if (res.data.channels && Array.isArray(res.data.channels)) {
        rawList = res.data.channels;
      }
      const channels = rawList.map(normalizeSupportChannel).filter(Boolean) as ISupportChannel[];
      return { channels };
    }

    // fallback إلى المسار العام إذا تعذر مسار الإدارة
    const fallback = await fetchSupportChannels();
    return fallback;
  } catch (error) {
    console.error("❌ Error fetching admin support channels:", error);
    return { channels: [] };
  }
}

/**
 * جلب قنوات الدعم العامة للواجهة
 */
export async function fetchSupportChannels(): Promise<{ channels: ISupportChannel[] }> {
  try {
    const res = await apiClient<any>("/support-channels", { skipAuth: true });
    if (res.success && res.data) {
      let rawList: any[] = [];
      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        rawList = res.data.data;
      } else if (res.data.channels && Array.isArray(res.data.channels)) {
        rawList = res.data.channels;
      }
      const channels = rawList
        .map(normalizeSupportChannel)
        .filter(Boolean) as ISupportChannel[];
      channels.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      return { channels };
    }
    return { channels: [] };
  } catch (error) {
    console.error("❌ Error fetching public support channels:", error);
    return { channels: [] };
  }
}

/**
 * إنشاء قناة دعم جديدة
 */
export async function createSupportChannel(
  data: {
    name: string;
    type?: string;
    value: string;
    icon?: string;
    order_index?: number;
    is_active?: boolean;
  },
  token?: string | null
): Promise<{ success: boolean; data?: ISupportChannel; error?: string }> {
  try {
    const payload = {
      name: data.name.trim(),
      type: data.type || "text",
      value: data.value.trim(),
      icon: data.icon || "fa-solid fa-check",
      order_index: data.order_index ?? 1,
      is_active: data.is_active ?? true,
    };

    const res = await apiClient<any>(
      "/admin/support-channels",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );

    if (res.success) {
      const channel = normalizeSupportChannel(res.data);
      return { success: true, data: channel || undefined };
    }
    return { success: false, error: res.error || res.message || "فشل إنشاء القناة" };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل إنشاء القناة" };
  }
}

/**
 * تعديل قناة دعم
 */
export async function updateSupportChannel(
  id: string | number,
  data: Partial<{
    name: string;
    type: string;
    value: string;
    icon: string;
    order_index: number;
    is_active: boolean;
  }>,
  token?: string | null
): Promise<{ success: boolean; data?: ISupportChannel; error?: string }> {
  try {
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.type !== undefined) payload.type = data.type;
    if (data.value !== undefined) payload.value = data.value;
    if (data.icon !== undefined) payload.icon = data.icon;
    if (data.order_index !== undefined) payload.order_index = data.order_index;
    if (data.is_active !== undefined) payload.is_active = data.is_active;

    // 1. جرب PATCH
    const res = await apiClient<any>(
      `/admin/support-channels/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    );

    if (res.success) {
      const channel = normalizeSupportChannel(res.data);
      return { success: true, data: channel || undefined };
    }

    // 2. بديل: PUT
    const putRes = await apiClient<any>(
      `/admin/support-channels/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token
    );
    if (putRes.success) {
      const channel = normalizeSupportChannel(putRes.data);
      return { success: true, data: channel || undefined };
    }

    // 3. بديل: POST مع _method: PATCH
    const postRes = await apiClient<any>(
      `/admin/support-channels/${id}`,
      {
        method: "POST",
        body: JSON.stringify({ ...payload, _method: "PATCH" }),
      },
      token
    );
    if (postRes.success) {
      const channel = normalizeSupportChannel(postRes.data);
      return { success: true, data: channel || undefined };
    }

    return { success: false, error: res.error || res.message || "فشل تعديل القناة" };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل تعديل القناة" };
  }
}

/**
 * حذف قناة دعم
 */
export async function deleteSupportChannel(
  id: string | number,
  token?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient<void>(
      `/admin/support-channels/${id}`,
      { method: "DELETE" },
      token
    );
    return { success: res.success, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل حذف القناة" };
  }
}
