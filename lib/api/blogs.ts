// lib/api/blogs.ts
import { apiClient } from "./config";
import { stripHtml, cleanAndFormatBlogContent } from "@/lib/utils";

export interface IBlog {
  id: number;
  name: string;
  title?: string;
  description: string;
  content?: string;
  category?: string;
  category_id?: number | null;
  image_url: string | null;
  image?: string | null;
  inspect_link?: string | null;
  buy_link?: string | null;
  video_link?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface IBlogsPagination {
  current_page: number;
  data?: IBlog[];
  total: number;
  per_page: number;
  last_page: number;
}

interface IAdminPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toNumberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function toCleanImageValue(rawImage: unknown): string | null {
  const image = toStringValue(rawImage).trim();
  if (!image || image.includes("[object")) {
    return null;
  }
  return image;
}

function parseCollectionPayload(
  payload: unknown,
  pageFallback: number,
  perPageFallback: number,
): { items: unknown[]; pagination?: IAdminPagination } {
  if (Array.isArray(payload)) {
    return { items: payload };
  }

  if (!isRecord(payload)) {
    return { items: [] };
  }

  const rootData = isRecord(payload.data) ? payload.data : payload;
  const directArray = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(rootData?.data)
      ? rootData.data
      : Array.isArray(rootData?.blogs)
        ? rootData.blogs
        : Array.isArray(rootData?.items)
          ? rootData.items
          : [];

  if (directArray.length > 0 || rootData === payload) {
    const pagination: IAdminPagination = {
      current_page: toNumberValue(
        rootData.current_page ?? payload.current_page,
        pageFallback,
      ),
      last_page: toNumberValue(rootData.last_page ?? payload.last_page, 1),
      per_page: toNumberValue(
        rootData.per_page ?? payload.per_page,
        perPageFallback,
      ),
      total: toNumberValue(rootData.total ?? payload.total, directArray.length),
      from:
        typeof (rootData.from ?? payload.from) === "number"
          ? Number(rootData.from ?? payload.from)
          : null,
      to:
        typeof (rootData.to ?? payload.to) === "number"
          ? Number(rootData.to ?? payload.to)
          : null,
    };

    return { items: directArray, pagination };
  }

  return { items: [] };
}

/**
 * جلب قائمة المقالات العامة
 */
export async function fetchBlogs(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
}): Promise<{ blogs: IBlog[]; pagination?: IBlogsPagination }> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.per_page) query.append("per_page", String(params.per_page));
    if (params?.category) query.append("category", params.category);
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient<unknown>(`/blogs${queryString}`);

    if (res.success && res.data !== undefined) {
      const parsed = parseCollectionPayload(
        res.data,
        params?.page || 1,
        params?.per_page || 15,
      );
      const blogs = parsed.items
        .map((item) => normalizeBlog(item))
        .filter((item): item is IBlog => Boolean(item));

      const pagination: IBlogsPagination | undefined = parsed.pagination
        ? {
            current_page: parsed.pagination.current_page,
            last_page: parsed.pagination.last_page,
            per_page: parsed.pagination.per_page,
            total: parsed.pagination.total,
            data: blogs,
          }
        : undefined;

      return { blogs, pagination };
    }
    return { blogs: [] };
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    return { blogs: [] };
  }
}

export function normalizeBlog(raw: unknown): IBlog | null {
  if (!raw) return null;

  const source = isRecord(raw) ? raw : null;
  if (!source) return null;

  const sourceData = source.data;
  const item = isRecord(source.blog)
    ? source.blog
    : isRecord(sourceData) && isRecord(sourceData.blog)
      ? sourceData.blog
      : isRecord(sourceData)
        ? sourceData
        : source;

  const rawImage = item.image_url ?? item.image;
  const cleanImage = toCleanImageValue(rawImage);

  const rawContent =
    toStringValue(item.content) || toStringValue(item.description);
  const cleanContent = cleanAndFormatBlogContent(rawContent);
  const cleanDescription = stripHtml(
    toStringValue(item.description) || rawContent,
  )
    .slice(0, 200)
    .trim();
  const title = toStringValue(item.title) || toStringValue(item.name) || "";

  const rawCategoryId =
    item.category_id ??
    (isRecord(item.category) ? item.category.id : undefined) ??
    (isRecord(item.support_category) ? item.support_category.id : undefined);

  const categoryId =
    rawCategoryId !== undefined && rawCategoryId !== null
      ? toNumberValue(rawCategoryId, 0) || null
      : null;

  const categoryValue = item.category ?? item.support_category;
  const category = isRecord(categoryValue)
    ? toStringValue(categoryValue.name)
    : toStringValue(categoryValue) ||
      toStringValue(item.category_name) ||
      undefined;

  return {
    id: toNumberValue(item.id, 0),
    name: title,
    title: title,
    description: cleanDescription,
    content: cleanContent,
    category,
    category_id: categoryId,
    image_url: cleanImage,
    image: cleanImage,
    inspect_link: toStringValue(item.inspect_link) || null,
    buy_link: toStringValue(item.buy_link) || null,
    video_link: toStringValue(item.video_link) || null,
    created_at: toStringValue(item.created_at) || new Date().toISOString(),
    updated_at: toStringValue(item.updated_at) || undefined,
  };
}

/**
 * جلب تفاصيل مقالة مع المقالات ذات الصلة
 */
export async function fetchBlogDetails(
  id: string | number,
  token?: string | null,
): Promise<{ blog: IBlog | null; related_blogs: IBlog[] }> {
  try {
    const res = await apiClient<unknown>(`/blogs/${id}`, {}, token);
    if (res.success && res.data) {
      const blog = normalizeBlog(res.data);
      const relatedFromRoot = isRecord(res.data)
        ? res.data.related_blogs
        : undefined;
      const relatedFromData =
        isRecord(res.data) && isRecord(res.data.data)
          ? res.data.data.related_blogs
          : undefined;
      const rawRelated = Array.isArray(relatedFromRoot)
        ? relatedFromRoot
        : Array.isArray(relatedFromData)
          ? relatedFromData
          : [];
      const related_blogs = Array.isArray(rawRelated)
        ? rawRelated
            .map((r) => normalizeBlog(r))
            .filter((item): item is IBlog => Boolean(item))
        : [];
      return { blog, related_blogs };
    }

    const adminRes = await apiClient<unknown>(`/admin/blogs/${id}`, {}, token);
    if (adminRes.success && adminRes.data) {
      const blog = normalizeBlog(adminRes.data);
      const relatedFromRoot = isRecord(adminRes.data)
        ? adminRes.data.related_blogs
        : undefined;
      const relatedFromData =
        isRecord(adminRes.data) && isRecord(adminRes.data.data)
          ? adminRes.data.data.related_blogs
          : undefined;
      const rawRelated = Array.isArray(relatedFromRoot)
        ? relatedFromRoot
        : Array.isArray(relatedFromData)
          ? relatedFromData
          : [];
      const related_blogs = Array.isArray(rawRelated)
        ? rawRelated
            .map((r) => normalizeBlog(r))
            .filter((item): item is IBlog => Boolean(item))
        : [];
      return { blog, related_blogs };
    }

    return { blog: null, related_blogs: [] };
  } catch (error) {
    console.error(`❌ Error fetching blog details [${id}]:`, error);
    return { blog: null, related_blogs: [] };
  }
}

/**
 * جلب مقالة مفردة بواسطة الـ ID من لوحة التحكم (admin/blogs/{id} أو blogs/{id})
 */
export async function fetchAdminBlogById(
  id: string | number,
  token?: string | null,
): Promise<IBlog | null> {
  try {
    const res = await apiClient<unknown>(`/admin/blogs/${id}`, {}, token);
    if (res.success && res.data) {
      const blog = normalizeBlog(res.data);
      if (blog && blog.id) return blog;
    }

    // Fallback: جرب endpoint العام /blogs/{id}
    const pubRes = await apiClient<unknown>(`/blogs/${id}`);
    if (pubRes.success && pubRes.data) {
      const blog = normalizeBlog(pubRes.data);
      if (blog && blog.id) return blog;
    }
    return null;
  } catch (error) {
    console.error(`❌ Error fetching admin blog [${id}]:`, error);
    return null;
  }
}

/**
 * جلب مقالة مفردة بواسطة الـ ID
 */
export async function fetchBlogById(
  id: string | number,
  token?: string | null,
): Promise<IBlog | null> {
  try {
    // جرب endpoint العام /blogs/{id}
    const res = await apiClient<unknown>(`/blogs/${id}`);
    if (res.success && res.data) {
      const blog = normalizeBlog(res.data);
      if (blog && blog.id) return blog;
    }

    // ثم endpoint لوحة التحكم
    const adminRes = await apiClient<unknown>(`/admin/blogs/${id}`, {}, token);
    if (adminRes.success && adminRes.data) {
      const blog = normalizeBlog(adminRes.data);
      if (blog && blog.id) return blog;
    }

    return null;
  } catch (error) {
    console.error(`❌ Error fetching blog [${id}]:`, error);
    return null;
  }
}

export async function fetchAdminBlogs(
  token?: string | null,
  page: number = 1,
): Promise<{ blogs: IBlog[]; pagination?: IAdminPagination }> {
  try {
    const res = await apiClient<unknown>(
      `/admin/blogs?page=${page}`,
      { forceRefresh: true },
      token,
    );
    if (res.success && res.data !== undefined) {
      const parsed = parseCollectionPayload(res.data, page, 15);
      const blogs = parsed.items
        .map((item) => normalizeBlog(item))
        .filter((item): item is IBlog => Boolean(item));
      if (parsed.pagination) {
        return { blogs, pagination: parsed.pagination };
      }
      if (blogs.length > 0) {
        return { blogs };
      }
    }
    const fallback = await fetchBlogs({ page, per_page: 15 });
    return {
      blogs: fallback.blogs,
      pagination: fallback.pagination
        ? {
            current_page: fallback.pagination.current_page,
            last_page: fallback.pagination.last_page,
            per_page: fallback.pagination.per_page,
            total: fallback.pagination.total,
          }
        : undefined,
    };
  } catch (error) {
    console.error("❌ Error fetching admin blogs:", error);
    const fallback = await fetchBlogs({ page, per_page: 15 });
    return {
      blogs: fallback.blogs,
      pagination: fallback.pagination
        ? {
            current_page: fallback.pagination.current_page,
            last_page: fallback.pagination.last_page,
            per_page: fallback.pagination.per_page,
            total: fallback.pagination.total,
          }
        : undefined,
    };
  }
}

/**
 * إنشاء مقالة جديدة
 */
export async function createAdminBlog(
  formData: FormData,
  token?: string | null,
): Promise<{ success: boolean; data?: IBlog; error?: string }> {
  try {
    const titleVal = (formData.get("title") || formData.get("name")) as string;
    if (titleVal) {
      formData.set("title", titleVal);
      formData.set("name", titleVal);
    }

    // إرسال description و content كما هم بدون sync
    const descVal = (formData.get("description") || "") as string;
    const contentVal = (formData.get("content") || "") as string;

    if (descVal) {
      formData.set("description", descVal);
    }
    if (contentVal) {
      formData.set("content", contentVal);
    }

    // ضبط category_id وإزالة category النصية لتفادي أخطاء السيرفر
    const catIdVal = formData.get("category_id") || formData.get("category");
    if (catIdVal && !isNaN(Number(catIdVal))) {
      formData.set("category_id", String(catIdVal));
      formData.delete("category");
    } else {
      formData.delete("category");
      formData.delete("category_id");
    }

    // التأكد من أن حقل image إذا كان نصاً لا يرسل كـ image لتجنب أخطاء Laravel
    const imageVal = formData.get("image");
    if (imageVal && typeof imageVal === "string") {
      formData.delete("image");
    }

    if (token && !formData.has("bearer_token")) {
      formData.append("bearer_token", token);
    }

    const res = await apiClient<IBlog>(
      "/admin/blogs",
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
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "فشل إنشاء المقالة"),
    };
  }
}

/**
 * تعديل مقالة
 */
export async function updateAdminBlog(
  id: string | number,
  formData: FormData,
  token?: string | null,
): Promise<{ success: boolean; data?: IBlog; error?: string }> {
  try {
    const titleVal = (formData.get("title") || formData.get("name")) as string;
    if (titleVal) {
      formData.set("title", titleVal);
      formData.set("name", titleVal);
    }

    // إرسال description و content كما هم بدون sync
    const descVal = (formData.get("description") || "") as string;
    const contentVal = (formData.get("content") || "") as string;

    if (descVal) {
      formData.set("description", descVal);
    }
    if (contentVal) {
      formData.set("content", contentVal);
    }

    // ضبط category_id وإزالة category النصية لتفادي أخطاء السيرفر
    const catIdVal = formData.get("category_id") || formData.get("category");
    if (catIdVal && !isNaN(Number(catIdVal))) {
      formData.set("category_id", String(catIdVal));
      formData.delete("category");
    } else {
      formData.delete("category");
      formData.delete("category_id");
    }

    const updateImageVal = formData.get("image");
    if (updateImageVal && typeof updateImageVal === "string") {
      formData.delete("image");
    }

    if (token && !formData.has("bearer_token")) {
      formData.append("bearer_token", token);
    }

    const hasImageFile =
      updateImageVal &&
      typeof updateImageVal === "object" &&
      "name" in updateImageVal;

    let res;
    if (hasImageFile) {
      formData.set("_method", "PATCH");
      res = await apiClient<IBlog>(
        `/admin/blogs/${id}`,
        {
          method: "POST",
          body: formData,
        },
        token,
      );
      if (!res.success) {
        formData.set("_method", "PUT");
        res = await apiClient<IBlog>(
          `/admin/blogs/${id}`,
          {
            method: "POST",
            body: formData,
          },
          token,
        );
      }
    } else {
      res = await apiClient<IBlog>(
        `/admin/blogs/${id}`,
        {
          method: "PATCH",
          body: formData,
        },
        token,
      );

      if (!res.success) {
        formData.set("_method", "PATCH");
        const postRes = await apiClient<IBlog>(
          `/admin/blogs/${id}`,
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
          };
        }
      }
    }

    return {
      success: res.success,
      data: res.data,
      error: res.error || (res.success ? undefined : res.message),
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "فشل تعديل المقالة"),
    };
  }
}

/**
 * حذف مقالة
 */
export async function deleteAdminBlog(
  id: string | number,
  token?: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient<void>(
      `/admin/blogs/${id}`,
      {
        method: "DELETE",
      },
      token,
    );

    return {
      success: res.success,
      error: res.error,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "فشل حذف المقالة"),
    };
  }
}
