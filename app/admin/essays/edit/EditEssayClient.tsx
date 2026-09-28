"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuill } from "react-quilljs";
import { FaArrowRight, FaImage, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import {
  ISupportCategory,
  fetchAdminSupportCategories,
} from "@/lib/api/support-categories";
import { updateAdminBlog } from "@/lib/api/blogs";
import { invalidateCache } from "@/lib/hooks/useCache";

interface EditEssayClientProps {
  onSave?: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  initialCategories?: ISupportCategory[];
  initialData: {
    id: string | number;
    title?: string;
    name?: string;
    description?: string;
    content?: string;
    image_url?: string | null;
    category?: string;
    category_id?: number | null;
    created_at?: string;
  };
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

export default function EditEssayClient({
  onSave,
  initialData,
  initialCategories = [],
}: EditEssayClientProps) {
  const router = useRouter();

  // Categories State
  const [categories, setCategories] =
    useState<ISupportCategory[]>(initialCategories);
  const [categoryId, setCategoryId] = useState<string>(
    initialData.category_id ? String(initialData.category_id) : "",
  );

  // Form State - Initialize with existing data
  const [title, setTitle] = useState(
    initialData.title || initialData.name || "",
  );
  const [description, setDescription] = useState(initialData.description || "");
  const [content, setContent] = useState(initialData.content || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData.image_url || null,
  );

  // جلب الفئات كـ Fallback
  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetchAdminSupportCategories().then((cats) => {
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
      });
    }
  }, [initialCategories]);

  // مطابقة الفئة بالاسم في حال عدم توفر category_id مسبقاً
  useEffect(() => {
    if (!categoryId && initialData.category && categories.length > 0) {
      const matched = categories.find(
        (c) =>
          c.name.trim().toLowerCase() ===
          initialData.category?.trim().toLowerCase(),
      );
      if (matched) {
        setCategoryId(String(matched.id));
      }
    }
  }, [categories, categoryId, initialData.category]);
  const [existingImage, setExistingImage] = useState<string | null>(
    initialData.image_url || null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quill Editor Configuration
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        ["image", "code-block", "link"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ header: [1, 2, 3, 4, 5, false] }],
        [{ align: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["strike", "underline", "italic", "bold"],
        [{ color: [] }, { background: [] }],
      ],
    },
    placeholder: "أضف تفاصيل المقال هنا...",
    theme: "snow",
  });

  // Set initial content in Quill editor
  useEffect(() => {
    if (quill && initialData.content) {
      quill.root.innerHTML = initialData.content;
      setContent(initialData.content);
    }
  }, [quill, initialData.content]);

  // Listen to Quill changes
  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        setContent(quill.root.innerHTML);
      });
    }
  }, [quill]);

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
    setExistingImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Handler - يرسل البيانات للتعديل كما في الثيم تماماً
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
      toast.error(`الوصف الفرعي طويل جداً (${description.trim().length} حرف). الحد الأقصى المسموح به حالياً لقاعدة البيانات هو 255 حرفاً.`);
      return;
    }

    const editorHtml = (quill ? quill.root.innerHTML : "") || content;
    const editorText = quill ? quill.getText().trim() : "";
    if (!editorText && !editorHtml.trim()) {
      toast.error("يرجى كتابة محتوى المقالة");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("جاري حفظ التعديلات...");

    try {
      const token = getAuthToken();

      const formData = new FormData();
      formData.append("original_id", String(initialData.id));
      formData.append("name", title.trim());
      formData.append("title", title.trim());
      formData.append("category_id", String(categoryId));
      formData.append("description", description.trim());
      formData.append("content", editorHtml);
      formData.delete("category");

      // فقط إذا تم اختيار File جديد نرسله كـ image
      if (
        imageFile &&
        typeof imageFile === "object" &&
        "name" in imageFile
      ) {
        formData.append("image", imageFile);
      }

      // إرسال الصورة الموجودة إذا لم يتم تغييرها
      if (existingImage && !imageFile) {
        formData.append("existing_image", existingImage);
      }

      if (token) {
        formData.append("bearer_token", token);
      }

      console.log("Sending Essay FormData to API (admin/blogs update):");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      let res;
      try {
        res = await updateAdminBlog(initialData.id, formData, token);
      } catch (directErr) {
        if (onSave) {
          res = await onSave(formData);
        } else {
          throw directErr;
        }
      }

      if (res.success) {
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
            window.dispatchEvent(
              new CustomEvent("data-mutated", { detail: { type: "all" } })
            );
            window.dispatchEvent(new Event("blogs-updated"));
          } catch (e) {
            console.warn("Could not clear cache:", e);
          }
        }

        invalidateCache("admin_blogs");
        invalidateCache("blogs");
        invalidateCache("admin_essays");
        invalidateCache("essays");

        toast.success("✅ تم تعديل المقالة بنجاح!", { id: toastId });
        router.push("/admin/essays");
        router.refresh();
      } else {
        toast.error(res.error || "حدث خطأ أثناء تعديل المقالة", { id: toastId });
      }
    } catch (err: unknown) {
      console.error("Error submitting essay:", err);
      toast.error(`❌ فشل الإرسال: ${getErrorMessage(err)}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100 dark:border-zinc-800 shadow-sm"
      dir="rtl"
    >
      {/* ─── Page Header with Back Arrow ─────────────────────────── */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <Link
          href="/admin/essays"
          className="p-2 rounded-xl text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          title="الرجوع إلى المقالات"
        >
          <FaArrowRight className="text-lg" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          تعديل المقالة
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Row 1: Title & Category ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
              عنوان رئيسي <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ادخل عنوان مناسب للمقالة"
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

        {/* ─── Row 4: Image Upload Dropzone (صورة المقالة *) ────────── */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            صورة المقالة
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
                    {imageFile?.name || "صورة التيم ومز"} (
                    {imageFile ? (imageFile.size / 1024).toFixed(1) : "500"} KB)
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

        {/* ─── Row 5: Rich Text Editor (أضف المقالة هنا *) ──────────── */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            صف المقالة هنا <span className="text-red-500">*</span>
          </label>
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.04)] relative">
            <div ref={quillRef} className="min-h-[220px]" />

            {/* In-editor Add Action Button */}
            <div className="p-3 border-t border-gray-100 dark:border-zinc-700/50 flex justify-start bg-gray-50/30 dark:bg-zinc-800/30">
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (ev: Event) => {
                    const target = ev.target as HTMLInputElement | null;
                    const f = target?.files?.[0];
                    if (f && quill) {
                      const r = new FileReader();
                      r.onload = (e) => {
                        const range = quill.getSelection(true);
                        quill.insertEmbed(
                          range.index,
                          "image",
                          e.target?.result,
                        );
                      };
                      r.readAsDataURL(f);
                    }
                  };
                  input.click();
                }}
                className="bg-[#1e2337] hover:bg-[#2b334d] text-white px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <span>إضافة</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Form Footer with Save Buttons ────────────────────────── */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/essays")}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-200 px-8 py-3 rounded-full font-bold transition-all active:scale-95"
          >
            إلغاء
          </button>
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
              <span>حفظ التعديلات</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
