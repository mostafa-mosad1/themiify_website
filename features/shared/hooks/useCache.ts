/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";

// ⏱️ فترات التخزين المؤقت في الذاكرة (Memory Cache TTL)
export const CACHE_DURATION = {
  THEMES: 3 * 60 * 1000, // 3 دقائق
  ESSAYS: 3 * 60 * 1000, // 3 دقائق
  CATEGORIES: 5 * 60 * 1000, // 5 دقائق
  PLATFORMS: 5 * 60 * 1000, // 5 دقائق
  USERS: 60 * 1000, // دقيقة واحدة
  LOGS: 0,
  DEFAULT: 3 * 60 * 1000, // 3 دقائق
};

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
}

// تخزين مركزي في ذاكرة المتصفح (In-memory Cache) يحتفظ بالبيانات عبر الـ Navigations ويمنع تكرار الريكويستات
const globalMemoryCache = new Map<string, CacheEntry>();

export function invalidateCache(prefix?: string) {
  if (!prefix || prefix === "all") {
    globalMemoryCache.clear();
  } else {
    for (const key of globalMemoryCache.keys()) {
      if (key.startsWith(prefix) || key.includes(prefix)) {
        globalMemoryCache.delete(key);
      }
    }
  }
}

interface CacheOptions {
  duration?: number;
  cacheKey?: string;
  forceRefresh?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  localParams?: Record<string, string>;
}

/**
 * دالة جلب البيانات مع التخزين المؤقت في الذاكرة (In-Memory Cache)
 * تحتفظ بالبيانات أثناء التنقل بين الصفحات وتمنع تكرار طلبات الشبكة نهائياً طالما الكاش سارٍ
 */
export function useCache<T = any>(
  tableName: string,
  fetcher?: (() => Promise<any>) | ((client: any) => any),
  options: CacheOptions = {},
) {
  const cacheKey = options.cacheKey
    ? `${tableName}_${options.cacheKey}`
    : tableName;
  const duration =
    options.duration !== undefined
      ? options.duration
      : ((CACHE_DURATION as any)[tableName.toUpperCase()] ??
        CACHE_DURATION.DEFAULT);

  // فحص الكاش المسبق لتجهيز الحالة فوراً بدون وميض تحميل وبدون ريكوست شبكة
  const cachedEntry = globalMemoryCache.get(cacheKey);
  const isInitialValid = Boolean(
    cachedEntry &&
    duration > 0 &&
    Date.now() - cachedEntry.timestamp < duration,
  );

  const [data, setData] = useState<T | null>(
    isInitialValid ? (cachedEntry!.data as T) : null,
  );
  const [loading, setLoading] = useState(!isInitialValid);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    isInitialValid ? new Date(cachedEntry!.timestamp) : null,
  );
  const previousCacheKeyRef = useRef(cacheKey);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(
    async (signal?: AbortSignal, force = false) => {
      // إذا كان الكاش سارياً ولم يُطلب التحديث الإجباري، نستخدمه مباشرة ولا نرسل أي ريكوست
      const currentEntry = globalMemoryCache.get(cacheKey);
      if (
        !force &&
        !optionsRef.current.forceRefresh &&
        currentEntry &&
        duration > 0 &&
        Date.now() - currentEntry.timestamp < duration
      ) {
        setData(currentEntry.data as T);
        setLoading(false);
        setLastUpdated(new Date(currentEntry.timestamp));
        if (optionsRef.current.onSuccess)
          optionsRef.current.onSuccess(currentEntry.data);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let freshData: T;
        const currentFetcher = fetcherRef.current;

        if (currentFetcher) {
          const result = await currentFetcher({});
          if (
            result &&
            typeof result === "object" &&
            "data" in result &&
            !Array.isArray(result)
          ) {
            freshData = (result.data || []) as T;
          } else {
            freshData = result as T;
          }
        } else {
          freshData = [] as unknown as T;
        }

        if (signal?.aborted) return;

        // حفظ النتيجة في الذاكرة لمنع تكرار الطلب عند العودة للصفحة
        if (duration > 0) {
          globalMemoryCache.set(cacheKey, {
            data: freshData,
            timestamp: Date.now(),
          });
        }

        setData(freshData as T);
        setLastUpdated(new Date());

        if (optionsRef.current.onSuccess)
          optionsRef.current.onSuccess(freshData);
      } catch (err: any) {
        if (signal?.aborted) return;
        console.error(`Error fetching ${tableName}:`, err);
        setError(err.message);
        if (optionsRef.current.onError) optionsRef.current.onError(err);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [cacheKey, duration, tableName],
  );

  useEffect(() => {
    if (previousCacheKeyRef.current !== cacheKey) {
      const nextEntry = globalMemoryCache.get(cacheKey);
      const nextIsValid = Boolean(
        nextEntry &&
        duration > 0 &&
        Date.now() - nextEntry.timestamp < duration,
      );

      setData(nextIsValid ? (nextEntry!.data as T) : null);
      setLoading(!nextIsValid);
      setError(null);
      setLastUpdated(nextIsValid ? new Date(nextEntry!.timestamp) : null);
      previousCacheKeyRef.current = cacheKey;
    }

    const controller = new AbortController();

    // إذا كانت البيانات صالحة في الكاش، لا نرسل ريكوست إضافي عند الـ mount
    const currentEntry = globalMemoryCache.get(cacheKey);
    const isValid = Boolean(
      currentEntry &&
      duration > 0 &&
      Date.now() - currentEntry.timestamp < duration,
    );

    if (!isValid || optionsRef.current.forceRefresh) {
      refresh(controller.signal);
    }

    const handleMutation = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetTable = customEvent.detail?.type;
      if (!targetTable || targetTable === tableName || targetTable === "all") {
        invalidateCache(tableName);
        refresh(undefined, true);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("data-mutated", handleMutation);
      window.addEventListener(`${tableName}-updated`, () => {
        invalidateCache(tableName);
        refresh(undefined, true);
      });
    }

    return () => {
      controller.abort();
      if (typeof window !== "undefined") {
        window.removeEventListener("data-mutated", handleMutation);
        window.removeEventListener(`${tableName}-updated`, () => {});
      }
    };
  }, [tableName, cacheKey, duration, refresh]);

  const clearCache = useCallback(() => {
    globalMemoryCache.delete(cacheKey);
    setData(null);
    setLastUpdated(null);
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: (force = true) => refresh(undefined, force),
    clearCache,
  };
}

export function useStats() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStats = async () => {
      try {
        const { fetchThemes } = await import("@/lib/api/themes");
        const { fetchBlogs } = await import("@/lib/api/blogs");
        const { fetchCategories } = await import("@/lib/api/categories");
        const { fetchPlatforms } = await import("@/lib/api/platforms");

        const [themesRes, essaysRes, categoriesRes, platformsRes] =
          await Promise.allSettled([
            fetchThemes(),
            fetchBlogs(),
            fetchCategories(),
            fetchPlatforms(),
          ]);

        if (controller.signal.aborted) return;

        setStats({
          themes:
            themesRes.status === "fulfilled"
              ? themesRes.value.themes.length
              : 0,
          essays:
            essaysRes.status === "fulfilled" ? essaysRes.value.blogs.length : 0,
          categories:
            categoriesRes.status === "fulfilled"
              ? categoriesRes.value.categories.length
              : 0,
          platforms:
            platformsRes.status === "fulfilled"
              ? platformsRes.value.platforms.length
              : 0,
          users: 0,
          admins: 0,
          endUsers: 0,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching stats:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      controller.abort();
    };
  }, []);

  return { stats, loading };
}

export function useItem<T = any>(
  tableName: string,
  id: string | number,
  fetcher?: () => Promise<T>,
  idField: string = "id",
) {
  return useCache<T>(
    tableName,
    async () => {
      if (fetcher) return await fetcher();
      return null as unknown as T;
    },
    {
      duration: CACHE_DURATION.DEFAULT,
      cacheKey: `${idField}_${id}`,
    },
  );
}
