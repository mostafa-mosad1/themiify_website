// lib/api/feedbacks.ts
import { apiClient } from "./config";

export interface IFeedbackPayload {
  full_name: string;
  phone_number: string;
  email?: string;
  store_link?: string;
  profession: string;
  rating: number;
  experience_feedback?: string;
  had_difficulty: boolean;
  difficulty_details?: string | null;
  improvements_suggestions?: string;
  recommendation: string;
  page_url?: string;
}

export interface IFeedbackItem {
  id: number;
  user_id?: string;
  full_name?: string;
  fullName?: string;
  phone_number?: string;
  phoneNumber?: string;
  email?: string;
  store_link?: string;
  storeLink?: string;
  profession?: string;
  rating?: number | string;
  overall_rating?: string;
  overallRating?: number | string;
  experience_feedback?: string;
  experienceFeedback?: string;
  had_difficulty?: boolean;
  hadDifficulty?: boolean;
  difficulty_details?: string | null;
  difficultyDetails?: string;
  improvements_suggestions?: string;
  improvementsSuggestions?: string;
  recommendation?: string | boolean;
  page_url?: string;
  pageUrl?: string;
  status?: string;
  admin_notes?: string;
  adminNotes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * إرسال تقييم جديد للباك إند
 */
export async function submitFeedback(
  feedbackData: IFeedbackPayload
): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const ratingVal =
      typeof feedbackData.rating === "number"
        ? feedbackData.rating
        : Number(feedbackData.rating) || 5;

    const payload = {
      full_name: feedbackData.full_name?.trim() || "",
      phone_number: feedbackData.phone_number?.trim() || "",
      email: feedbackData.email?.trim() || "",
      store_link: feedbackData.store_link?.trim() || "",
      profession: feedbackData.profession?.trim() || "",
      rating: ratingVal,
      rate: ratingVal,
      overall_rating: ratingVal,
      score: ratingVal,
      experience_feedback: feedbackData.experience_feedback?.trim() || "",
      had_difficulty: Boolean(feedbackData.had_difficulty),
      difficulty_details: feedbackData.had_difficulty && feedbackData.difficulty_details?.trim() ? feedbackData.difficulty_details.trim() : null,
      improvements_suggestions: feedbackData.improvements_suggestions?.trim() || "",
      recommendation: feedbackData.recommendation || "yes",
      page_url: feedbackData.page_url || (typeof window !== "undefined" ? window.location.href : ""),
    };

    const res = await apiClient<any>("/feedbacks", {
      method: "POST",
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || res.message || "فشل إرسال التقييم",
        message: res.message,
      };
    }

    return {
      success: true,
      data: res.data,
      message: res.message || "تم إرسال التقييم بنجاح",
    };
  } catch (error: any) {
    console.error("❌ Error submitting feedback:", error);
    return {
      success: false,
      error:
        error?.name === "AbortError"
          ? "انتهت مهلة الاتصال بالخادم، يرجى المحاولة مرة أخرى"
          : error?.message || "حدث خطأ غير متوقع أثناء إرسال التقييم",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * جلب جميع التقييمات للوحة التحكم
 */
export async function fetchAdminFeedbacks(
  token?: string | null
): Promise<{ feedbacks: IFeedbackItem[] }> {
  try {
    const res = await apiClient<IFeedbackItem[] | { data: IFeedbackItem[] }>(
      "/admin/feedbacks",
      {},
      token
    );

    let rawList: any[] = [];
    if (res.success && res.data) {
      if (Array.isArray(res.data)) rawList = res.data;
      else if (Array.isArray((res.data as any).data)) rawList = (res.data as any).data;
      else if (Array.isArray((res.data as any).feedbacks)) rawList = (res.data as any).feedbacks;
    }

    // Normalize items to support both camelCase and snake_case
    const normalizedList: IFeedbackItem[] = rawList.map((item) => {
      const rawRating = item.rating ?? item.rate ?? item.overall_rating ?? item.overallRating ?? item.score;
      const numRating = rawRating !== null && rawRating !== undefined && rawRating !== "" ? Number(rawRating) : null;
      
      let ratingText = "غير محدد";
      if (numRating !== null && !isNaN(numRating) && numRating > 0) {
        if (numRating >= 5) ratingText = "ممتاز";
        else if (numRating === 4) ratingText = "جيد جدًا";
        else if (numRating === 3) ratingText = "جيد";
        else if (numRating === 2) ratingText = "مقبول";
        else if (numRating <= 1) ratingText = "غير راضٍ";
      } else if (typeof rawRating === "string" && rawRating.trim()) {
        ratingText = rawRating;
      }

      return {
        ...item,
        fullName: item.full_name || item.fullName || "",
        phoneNumber: item.phone_number || item.phoneNumber || "",
        storeLink: item.store_link || item.storeLink || "",
        rating: numRating !== null && !isNaN(numRating) ? numRating : null,
        overallRating: ratingText,
        experienceFeedback: item.experience_feedback || item.experienceFeedback || "",
        hadDifficulty: item.had_difficulty !== undefined ? Boolean(item.had_difficulty) : Boolean(item.hadDifficulty),
        difficultyDetails: item.difficulty_details || item.difficultyDetails || "",
        improvementsSuggestions: item.improvements_suggestions || item.improvementsSuggestions || "",
        recommendation: item.recommendation === "yes" || item.recommendation === true || item.recommendation === "نعم",
        pageUrl: item.page_url || item.pageUrl || "",
        adminNotes: item.admin_notes || item.adminNotes || "",
        status: item.status || "جديد",
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
      };
    });

    return { feedbacks: normalizedList };
  } catch (error) {
    console.error("❌ Error fetching admin feedbacks:", error);
    return { feedbacks: [] };
  }
}

/**
 * تحديث تقييم من لوحة التحكم
 */
export async function updateAdminFeedback(
  id: number | string,
  updateData: Partial<IFeedbackItem>,
  token?: string | null
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await apiClient<any>(
      `/admin/feedbacks/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updateData),
      },
      token
    );
    return { success: res.success, data: res.data, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل تحديث التقييم" };
  }
}

/**
 * حذف تقييم من لوحة التحكم
 */
export async function deleteAdminFeedback(
  id: number | string,
  token?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient<any>(
      `/admin/feedbacks/${id}`,
      {
        method: "DELETE",
      },
      token
    );
    return { success: res.success, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل حذف التقييم" };
  }
}
