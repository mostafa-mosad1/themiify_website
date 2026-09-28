export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://dash.themiify.com/api/v1";

export interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean;
  silent?: boolean;
  forceRefresh?: boolean;
}

// ─── Global In-Memory API Cache & In-Flight Deduplication ─────────────────────
interface CacheEntry<T = any> {
  data: { success: boolean; data?: T; message?: string; error?: string };
  timestamp: number;
}

const apiGetCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<
  string,
  Promise<{ success: boolean; data?: any; message?: string; error?: string }>
>();

const API_CACHE_TTL = 60 * 1000; // 60 seconds cache for identical GET requests

export function clearApiClientCache(prefix?: string) {
  if (!prefix || prefix === "all") {
    apiGetCache.clear();
  } else {
    for (const key of apiGetCache.keys()) {
      if (key.includes(prefix)) {
        apiGetCache.delete(key);
      }
    }
  }
}

/**
 * دالة مساعدة لعمل طلبات الـ API مع معالجة الأخطاء والـ Headers والتخزين المؤقت
 */
export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
  token?: string | null
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const method = (options.method || "GET").toUpperCase();
  const isGet = method === "GET";

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // إذا كانت العملية تعديل أو حذف أو إنشاء، نقوم بتفريغ كاش الكيان المعني
  if (!isGet) {
    const resource = cleanEndpoint.split("/").filter(Boolean)[0] || "";
    clearApiClientCache(resource);
  }

  // في المتصفح نستخدم الـ Proxy الداخلي (/api/v1) لتفادي أخطاء CORS تماماً
  const url =
    typeof window !== "undefined"
      ? (cleanEndpoint.startsWith("/api/v1") ? cleanEndpoint : `/api/v1${cleanEndpoint}`)
      : (cleanEndpoint.startsWith("/api/v1")
          ? `https://dash.themiify.com${cleanEndpoint}`
          : `${API_BASE_URL}${cleanEndpoint}`);

  let authToken = token;
  if (!options.skipAuth && !authToken && typeof window !== "undefined") {
    if (!authToken) {
      const match = document.cookie.match(
        /(?:^|;\s*)(?:authToken|adminToken|bearer_token|token|access_token|auth_token)=([^;]+)/
      );
      if (match) authToken = decodeURIComponent(match[1]);
    }
    if (!authToken && typeof localStorage !== "undefined") {
      authToken =
        localStorage.getItem("authToken") ||
        localStorage.getItem("bearer_token") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("access_token");
    }
  }

  const cacheKey = `${method}:${url}:${options.skipAuth ? "public" : authToken || "anon"}`;

  // فحص الكاش للـ GET requests لمنع تكرار الريكويستات
  if (isGet && !options.forceRefresh) {
    const cached = apiGetCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < API_CACHE_TTL) {
      return cached.data as { success: boolean; data?: T; message?: string; error?: string };
    }

    // إذا كان هناك نفس الريكويست قيد التنفيذ حالياً، نشترك فيه ونمنع التكرار (Deduplication)
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return (await inFlight) as { success: boolean; data?: T; message?: string; error?: string };
    }
  }

  const fetchPromise = (async () => {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (!options.skipAuth && authToken) {
        let cleanToken = String(authToken).trim();
        if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
          cleanToken = cleanToken.slice(1, -1);
        }
        cleanToken = cleanToken.replace(/^Bearer\s+/i, "").trim();
        if (cleanToken && cleanToken !== "undefined" && cleanToken !== "null") {
          headers["Authorization"] = `Bearer ${cleanToken}`;
        }
      }

      // إذا لم يكن FormData نحدد Content-Type تلقائياً
      if (
        !(options.body instanceof FormData) &&
        !headers["Content-Type"] &&
        options.body
      ) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      let result: any = null;
      try {
        const text = await response.text();
        result = text && text.trim() ? JSON.parse(text.trim()) : null;
      } catch {
        result = null;
      }

      if (!response.ok) {
        let errorMessage = result?.message || `HTTP error! status: ${response.status}`;
        if (result?.errors && typeof result.errors === "object") {
          const errorList: string[] = [];
          for (const [key, val] of Object.entries(result.errors)) {
            if (Array.isArray(val)) {
              errorList.push(`${key}: ${val.join(", ")}`);
            } else if (typeof val === "string") {
              errorList.push(`${key}: ${val}`);
            }
          }
          if (errorList.length > 0) {
            errorMessage = `${errorMessage} (${errorList.join(" | ")})`;
          }
        }

        if (!options.silent) {
          console.error(`❌ API Error [${response.status}] on [${endpoint}]:`, {
            status: response.status,
            message: result?.message,
            errors: result?.errors,
            result,
          });
        }

        return {
          success: false,
          message: errorMessage,
          error: errorMessage,
          data: result?.data || result?.errors,
        };
      }

      if (result?.status === false) {
        let errorMessage = result?.message || "بيانات غير صحيحة، يرجى التحقق من المدخلات";
        if (result?.errors && typeof result.errors === "object") {
          const errorList: string[] = [];
          for (const [key, val] of Object.entries(result.errors)) {
            if (Array.isArray(val)) {
              errorList.push(`${val.join(", ")}`);
            } else if (typeof val === "string") {
              errorList.push(`${val}`);
            }
          }
          if (errorList.length > 0) {
            errorMessage = `${errorMessage} (${errorList.join(" | ")})`;
          }
        }

        if (!options.silent) {
          console.error(`❌ API Logic Error on [${endpoint}]:`, {
            message: result?.message,
            errors: result?.errors,
            result,
          });
        }

        return {
          success: false,
          message: errorMessage,
          error: errorMessage,
          data: result?.data || result?.errors,
        };
      }

      const responseData = {
        success: true,
        data: result?.data !== undefined ? result.data : result,
        message: result?.message,
      };

      // حفظ النتيجة في الكاش للـ GET requests الناجحة
      if (isGet && responseData.success) {
        apiGetCache.set(cacheKey, {
          data: responseData,
          timestamp: Date.now(),
        });
      }

      return responseData as { success: boolean; data?: T; message?: string; error?: string };
    } catch (error: any) {
      if (!options.silent) {
        console.warn(`⚠️ API Network Notice on [${endpoint}]:`, error?.message || error);
      }
      return {
        success: false,
        error: error?.message || "حدث خطأ غير متوقع في الاتصال بالخادم",
      };
    }
  })();

  if (isGet) {
    inFlightRequests.set(cacheKey, fetchPromise);
    try {
      return await fetchPromise;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  }

  return await fetchPromise;
}
