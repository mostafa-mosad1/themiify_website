"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FaArrowRight, FaImage, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import {
  ISupportCategory,
  fetchAdminSupportCategories,
} from "@/lib/api/support-categories";
import { createAdminBlog } from "@/lib/api/blogs";
import { invalidateCache } from "@/lib/hooks/useCache";

const RichTextEditor = dynamic(
  () => import("@/components/shared/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[220px] bg-gray-50 dark:bg-zinc-800 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 text-sm">
        جاري تحميل المحرر...
      </div>
    ),
  }
);

interface AddEssayClientProps {
  onSave?: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  initialCategories?: ISupportCategory[];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "حدث خطأ غير متوقع";
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  let token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("bearer_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    null;
  if (!token) {
    const match = document.cookie.match(
      /(?:^|;\s*)(?:authToken|adminToken|bearer_token|token)=([^;]+)/,
    );
    if (match) token = decodeURIComponent(match[1]);
  }
  return token;
}

export default function AddEssayClient({
  onSave,
  initialCategories = [],
}: AddEssayClientProps) {
  const router = useRouter();

  // Form State
  const [categories, setCategories] =
    useState<ISupportCategory[]>(initialCategories);
  const [categoryId, setCategoryId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // جلب الفئات إذا لم تكن متوفرة
  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetchAdminSupportCategories().then((cats) => {
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
      });
    }
  }, [initialCategories]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to convert any pasted/inserted Base64 images to static uploaded URLs
  const convertBase64ImagesToUrls = async (html: string): Promise<string> => {
    if (!html || !html.includes("data:image/")) return html;

    const regex = /src=["'](data:image\/([a-zA-Z0-9+.-]+);base64,([^"']+))["']/g;
    let match;
    const matches: { full: string; dataUrl: string; mimeType: string; base64: string }[] = [];

    while ((match = regex.exec(html)) !== null) {
      matches.push({
        full: match[0],
        dataUrl: match[1],
        mimeType: `image/${match[2]}`,
        base64: match[3],
      });
    }

    if (matches.length === 0) return html;

    let resultHtml = html;
    for (const item of matches) {
      try {
        const binaryString = atob(item.base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const ext = item.mimeType.split("/")[1] || "png";
        const blob = new Blob([bytes], { type: item.mimeType });
        const file = new File(
          [blob],
          `img_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`,
          { type: item.mimeType }
        );

        const fd = new FormData();
        fd.append("image", file);

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (data.url || data.file?.url) {
          const uploadedUrl = data.url || data.file?.url;
          resultHtml = resultHtml.split(item.dataUrl).join(uploadedUrl);
        }
      } catch (err) {
        console.error("Error converting base64 image to URL:", err);
      }
    }

    return resultHtml;
  };

  // Image handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      toast.error("حجم الصورة يتجاوز الحد الأقصى (10 ميغابايت)");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Handler - يرسل الطلب كـ FormData مع image إلى admin/blogs POST كما في الثيم تماماً
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان المقالة");
      return;
    }

    if (!categoryId) {
      toast.error("يرجى اختيار تصنيف المقالة");
      return;
    }

    if (!description.trim()) {
      toast.error("يرجى إدخال وصف فرعي للمقالة");
      return;
    }

    if (description.trim().length > 255) {
      toast.error(
        `الوصف الفرعي طويل جداً (${description.trim().length} حرف). الحد الأقصى المسموح به حالياً لقاعدة البيانات هو 255 حرفاً.`
      );
      return;
    }

    if (!content || !content.trim() || content === "<p></p>" || content === "<p><br></p>") {
      toast.error("يرجى كتابة محتوى المقالة");
      return;
    }

    if (!imageFile) {
      toast.error("يرجى اختيار صورة المقالة");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("جاري إضافة المقالة...");

    try {
      const token = getAuthToken();

      // Clean all base64 images from content and upload as static files
      const cleanContent = await convertBase64ImagesToUrls(content);

      const formData = new FormData();
      formData.append("name", title.trim());
      formData.append("title", title.trim());
      formData.append("category_id", String(categoryId));
      formData.append("description", description.trim());
      formData.append("content", cleanContent);
      formData.delete("category");

      // إرسال صورة المقالة كـ File تحت اسم "image"
      if (
        imageFile &&
        typeof imageFile === "object" &&
        "name" in imageFile
      ) {
        formData.append("image", imageFile);
      }

      if (token) {
        formData.append("bearer_token", token);
      }

      // طباعة الـ FormData للتأكد والتشخيص
      console.log("Sending Essay FormData to API (admin/blogs POST):");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      let res;
      try {
        if (onSave) {
          res = await onSave(formData);
        } else {
          res = await createAdminBlog(formData, token);
        }
      } catch (saveErr) {
        if (onSave) {
          res = await createAdminBlog(formData, token);
        } else {
          throw saveErr;
        }
      }

      if (res.success) {
        // تفريغ كاش المقالات
        if (typeof window !== "undefined") {
          try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const k = localStorage.key(i);
              if (
                k &&
                (k.startsWith("cache_essays") ||
                  k.startsWith("admin_essays") ||
                  k.startsWith("cache_blogs") ||
                  k.startsWith("admin_blogs"))
              ) {
                localStorage.removeItem(k);
              }
            }
          } catch (e) {
            console.error("Failed to clear essays cache", e);
          }
        }
        invalidateCache("admin_essays");
        invalidateCache("cache_essays");
        invalidateCache("admin_blogs");
        invalidateCache("cache_blogs");

        toast.success("تمت إضافة المقالة بنجاح", { id: toastId });
        router.push("/admin/essays");
        router.refresh();
      } else {
        toast.error(res.error || "فشل إضافة المقالة", { id: toastId });
      }
    } catch (err: unknown) {
      console.error("Error creating essay:", err);
      toast.error(getErrorMessage(err), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ─── Breadcrumb & Header ──────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
       <Link prefetch={false}
          href="/admin/essays"
          className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
          title="رجوع للمقالات"
        >
          <FaArrowRight size={16} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            إضافة مقالة جديدة
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            قم بتعبئة تفاصيل المقالة واضغط على حفظ للنشر
          </p>
        </div>
      </div>

      {/* ─── Main Form ────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Row 1: Title & Category (عنوان المقالة * والتصنيف *) ──── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
              عنوان المقالة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: كيفية اختيار القالب المناسب لمتجرك"
              required
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.04)]"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
              تصنيف المقالة <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.04)] cursor-pointer"
            >
              <option value="">-- اختر التصنيف المناسب --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── Row 2: Short Description (وصف فرعي للمقالة *) ────────── */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
              وصف فرعي للمقالة <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-[11px] font-medium transition-colors ${
                description.length > 255 ? "text-red-500 font-bold" : "text-gray-400"
              }`}
            >
              {description.length} / 255 حرف
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="ادخل وصفاً موجزاً للمقالة هنا... (الحد الأقصى 255 حرف)"
            required
            className={`w-full bg-white dark:bg-zinc-800 border rounded-2xl p-4 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.04)] resize-none ${
              description.length > 255
                ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-gray-200 dark:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            }`}
          />
          {description.length > 255 && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">
              ⚠️ تنبيه: تجاوزت الحد المسموح لقاعدة البيانات (255 حرفاً)، يرجى اختصار الوصف لتجنب فشل الإرسال.
            </p>
          )}
        </div>

        {/* ─── Row 3: Image Upload Dropzone (صورة المقالة *) ────────── */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            صورة المقالة <span className="text-red-500">*</span>
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative ${
              isDragging
                ? "border-orange-500 bg-orange-50/40 dark:bg-orange-950/20"
                : "border-gray-300 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/40 hover:bg-gray-50 dark:hover:bg-zinc-800/70"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative group/preview w-52 h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="معاينة الصورة"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full">
                      تغيير الصورة
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {imageFile?.name} (
                    {imageFile ? (imageFile.size / 1024).toFixed(1) : "0"} KB)
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="text-red-500 hover:text-red-600 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1"
                  >
                    <FaTimes size={11} />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-gray-400 dark:text-gray-300 mb-3 text-2xl">
                  <FaImage />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <span>اسحب صورة أو </span>
                  <span className="text-orange-500 font-bold underline">
                    تصفح
                  </span>
                </p>
                <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
                  يسمح بصورة بحد أقصى 10 ميغابايت
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Row 4: Rich Text Editor (أضف المقالة هنا *) ──────────── */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            أضف المقالة هنا <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            value={content}
            onChange={(val) => setContent(val)}
            placeholder="أضف تفاصيل المقال هنا..."
          />
        </div>

        {/* ─── Form Footer with Save Button ────────────────────────── */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1e2337] hover:bg-[#2b334d] text-white px-10 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <span>حفظ</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}