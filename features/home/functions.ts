import { apiClient } from "@/lib/api/config";
import { type IHomeData, DEFAULT_HOME_DATA } from "./types";

/**
 * جلب بيانات الصفحة الرئيسية من الباك إند الجديد
 */
export async function fetchHomeData(): Promise<IHomeData> {
  try {
    const res = await apiClient<IHomeData>("/", {
      cache: "no-store",
    });

    if (res.success && res.data && res.data.header) {
      return res.data;
    }

    console.warn("⚠️ لم يتم استلام بيانات الهوم بنجاح، استخدام البيانات الافتراضية:", res.error);
    return DEFAULT_HOME_DATA;
  } catch (error) {
    console.error("❌ خطأ أثناء جلب بيانات الصفحة الرئيسية:", error);
    return DEFAULT_HOME_DATA;
  }
}
