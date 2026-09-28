import { apiClient } from "@/lib/api/config";
import type { IFaq } from "../types";
export type { IFaq };

export async function fetchFaqs(): Promise<{ faqs: IFaq[] }> {
  try {
    const res = await apiClient<IFaq[] | { data: IFaq[] }>("/faqs");
    if (res.success && res.data) {
      if (Array.isArray(res.data)) return { faqs: res.data };
      if (Array.isArray((res.data as any).data)) return { faqs: (res.data as any).data };
    }
    // Fallback: جرب /admin/support-questions
    const supportRes = await apiClient<any>("/admin/support-questions", { skipAuth: true, silent: true });
    if (supportRes.success && supportRes.data) {
      const list = Array.isArray(supportRes.data) ? supportRes.data : supportRes.data.data;
      if (Array.isArray(list)) {
        return {
          faqs: list.map((item: any) => ({
            id: item.id,
            question: item.question || item.question_ar || "",
            answer: item.answer || item.answer_ar || "",
            category: item.category?.name || item.category_name,
            order: item.order_index,
          })),
        };
      }
    }
    return { faqs: [] };
  } catch (error) {
    console.error("❌ Error fetching FAQs:", error);
    return { faqs: [] };
  }
}

export async function fetchAdminFaqs(token?: string | null): Promise<{ faqs: IFaq[] }> {
  try {
    const res = await apiClient<any>("/admin/support-questions", {}, token);
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : res.data.data;
      if (Array.isArray(list)) {
        return {
          faqs: list.map((item: any) => ({
            id: item.id,
            question: item.question || item.question_ar || "",
            answer: item.answer || item.answer_ar || "",
            category: item.category?.name || item.category_name,
            order: item.order_index,
          })),
        };
      }
    }
    const fallback = await apiClient<IFaq[] | { data: IFaq[] }>("/admin/faqs", {}, token);
    if (fallback.success && fallback.data) {
      if (Array.isArray(fallback.data)) return { faqs: fallback.data };
      if (Array.isArray((fallback.data as any).data)) return { faqs: (fallback.data as any).data };
    }
    return await fetchFaqs();
  } catch (error) {
    console.error("❌ Error fetching admin FAQs:", error);
    return { faqs: [] };
  }
}

export async function createAdminFaq(
  data: Partial<IFaq>,
  token?: string | null
): Promise<{ success: boolean; data?: IFaq; error?: string }> {
  try {
    const payload: Record<string, any> = {
      question: data.question || "",
      answer: data.answer || "",
    };
    if (data.category) payload.category = data.category;
    if (data.order !== undefined) payload.order = data.order;

    const res = await apiClient<IFaq>(
      "/admin/faqs",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
    return { success: res.success, data: res.data, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل إنشاء السؤال" };
  }
}

export async function updateAdminFaq(
  id: string | number,
  data: Partial<IFaq>,
  token?: string | null
): Promise<{ success: boolean; data?: IFaq; error?: string }> {
  try {
    const payload: Record<string, any> = {
      question: data.question || "",
      answer: data.answer || "",
    };
    if (data.category) payload.category = data.category;
    if (data.order !== undefined) payload.order = data.order;

    const res = await apiClient<IFaq>(
      `/admin/faqs/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    );
    return { success: res.success, data: res.data, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل تعديل السؤال" };
  }
}

export async function deleteAdminFaq(
  id: string | number,
  token?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient<void>(`/admin/faqs/${id}`, { method: "DELETE" }, token);
    return { success: res.success, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل حذف السؤال" };
  }
}
