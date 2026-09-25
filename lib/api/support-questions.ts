// lib/api/support-questions.ts
import { apiClient } from "./config";

export interface ISupportQuestion {
  id: number;
  category_id: number;
  question: string;
  answer: string;
  order_index?: number;
  is_active?: boolean;
  category?: {
    id: number;
    name: string;
  } | null;
  category_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function normalizeSupportQuestion(item: unknown): ISupportQuestion | null {
  if (!item || typeof item !== "object") return null;
  const rec = item as Record<string, unknown>;
  const id = Number(rec.id) || 0;
  if (!id && !rec.question && !rec.question_ar) return null;

  let categoryId = Number(rec.category_id);
  if (isNaN(categoryId) || categoryId <= 0) {
    if (rec.category && typeof rec.category === "object" && "id" in rec.category) {
      categoryId = Number((rec.category as Record<string, unknown>).id) || 1;
    } else {
      categoryId = 1;
    }
  }

  let categoryName: string | null = null;
  if (rec.category && typeof rec.category === "object" && "name" in rec.category) {
    categoryName = String((rec.category as Record<string, unknown>).name || "");
  } else if (typeof rec.category === "string") {
    categoryName = rec.category;
  } else if (typeof rec.category_name === "string") {
    categoryName = rec.category_name;
  }

  return {
    id,
    category_id: categoryId,
    question: String(rec.question || rec.question_ar || "").trim(),
    answer: String(rec.answer || rec.answer_ar || "").trim(),
    order_index: typeof rec.order_index === "number" ? rec.order_index : 1,
    is_active: rec.is_active !== false,
    category:
      rec.category && typeof rec.category === "object" && "id" in rec.category
        ? {
            id: Number((rec.category as Record<string, unknown>).id) || categoryId,
            name: categoryName || "",
          }
        : null,
    category_name: categoryName,
    created_at: typeof rec.created_at === "string" ? rec.created_at : undefined,
    updated_at: typeof rec.updated_at === "string" ? rec.updated_at : undefined,
  };
}

/**
 * جلب قائمة أسئلة الدعم
 */
export async function fetchAdminSupportQuestions(
  token?: string | null
): Promise<{ questions: ISupportQuestion[] }> {
  try {
    const res = await apiClient<unknown>("/admin/support-questions", {}, token);
    if (res.success && res.data) {
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

      const questions = rawList
        .map((item) => normalizeSupportQuestion(item))
        .filter((q): q is ISupportQuestion => Boolean(q && q.id));

      if (questions.length > 0) {
        return { questions };
      }
    }

    // Fallback: جلب الأسئلة من فئات الدعم admin/support-categories إن وجدت
    const catRes = await apiClient<unknown>("/admin/support-categories", {}, token);
    if (catRes.success && catRes.data) {
      let rawCats: unknown[] = [];
      if (Array.isArray(catRes.data)) {
        rawCats = catRes.data;
      } else if (
        typeof catRes.data === "object" &&
        catRes.data !== null &&
        "data" in catRes.data &&
        Array.isArray((catRes.data as Record<string, unknown>).data)
      ) {
        rawCats = (catRes.data as Record<string, unknown>).data as unknown[];
      }

      const extracted: ISupportQuestion[] = [];
      for (const cat of rawCats) {
        if (cat && typeof cat === "object" && "questions" in cat) {
          const recCat = cat as Record<string, unknown>;
          if (Array.isArray(recCat.questions)) {
            for (const q of recCat.questions) {
              const norm = normalizeSupportQuestion({
                ...(q as Record<string, unknown>),
                category_id: (q as Record<string, unknown>).category_id || recCat.id,
                category_name:
                  (q as Record<string, unknown>).category_name || recCat.name,
              });
              if (norm) extracted.push(norm);
            }
          }
        }
      }
      if (extracted.length > 0) {
        return { questions: extracted };
      }
    }

    return { questions: [] };
  } catch (error) {
    console.error("❌ Error fetching support questions:", error);
    return { questions: [] };
  }
}

/**
 * إنشاء سؤال دعم جديد
 */
export async function createAdminSupportQuestion(
  data: {
    category_id: number;
    question: string;
    answer: string;
    order_index?: number;
    is_active?: boolean;
  },
  token?: string | null
): Promise<{ success: boolean; data?: ISupportQuestion; error?: string }> {
  try {
    const payload = {
      category_id: Number(data.category_id),
      question: data.question.trim(),
      answer: data.answer.trim(),
      order_index: typeof data.order_index === "number" ? data.order_index : 1,
      is_active: data.is_active !== false,
    };

    const res = await apiClient<unknown>(
      "/admin/support-questions",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );

    return {
      success: res.success,
      data: res.data ? normalizeSupportQuestion(res.data) ?? undefined : undefined,
      error: res.error,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "فشل إنشاء السؤال",
    };
  }
}

/**
 * تعديل سؤال دعم
 */
export async function updateAdminSupportQuestion(
  id: string | number,
  data: {
    category_id?: number;
    question?: string;
    answer?: string;
    order_index?: number;
    is_active?: boolean;
  },
  token?: string | null
): Promise<{ success: boolean; data?: ISupportQuestion; error?: string }> {
  try {
    const payload: Record<string, unknown> = {};
    if (data.category_id !== undefined) payload.category_id = Number(data.category_id);
    if (data.question !== undefined) payload.question = data.question.trim();
    if (data.answer !== undefined) payload.answer = data.answer.trim();
    if (data.order_index !== undefined) payload.order_index = Number(data.order_index);
    if (data.is_active !== undefined) payload.is_active = Boolean(data.is_active);

    const res = await apiClient<unknown>(
      `/admin/support-questions/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    );

    return {
      success: res.success,
      data: res.data ? normalizeSupportQuestion(res.data) ?? undefined : undefined,
      error: res.error,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "فشل تعديل السؤال",
    };
  }
}

/**
 * حذف سؤال دعم
 */
export async function deleteAdminSupportQuestion(
  id: string | number,
  token?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient<void>(
      `/admin/support-questions/${id}`,
      {
        method: "DELETE",
      },
      token
    );

    return { success: res.success, error: res.error };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "فشل حذف السؤال",
    };
  }
}

/**
 * جلب أسئلة الدعم العامة للعميل عبر /support-questions
 */
export async function fetchSupportQuestions(): Promise<{ questions: ISupportQuestion[] }> {
  try {
    const res = await apiClient<unknown>("/support-questions", { skipAuth: true, silent: true });
    if (res.success && res.data) {
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

      const questions = rawList
        .map((item) => normalizeSupportQuestion(item))
        .filter((q): q is ISupportQuestion => Boolean(q && q.id));

      if (questions.length > 0) {
        return { questions };
      }
    }

    // Fallback: جلب عبر دالة لوحة التحكم أو فئات الدعم
    return await fetchAdminSupportQuestions();
  } catch (error) {
    console.error("❌ Error fetching client support questions:", error);
    return { questions: [] };
  }
}
