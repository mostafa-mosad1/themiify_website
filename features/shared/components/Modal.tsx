"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaTimes, FaChevronDown, FaSearch, FaCheck } from "react-icons/fa";
import { toast } from "sonner";
import { resolveIcon, CATEGORY_ICONS, ICON_CATEGORIES } from "@/lib/utils/iconMap";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-400 text-sm animate-pulse">
      جاري تحميل المحرر...
    </div>
  ),
});
export interface Field {
  name: string;
  label?: string;
  type:
    | "text"
    | "email"
    | "password"
    | "select"
    | "textarea"
    | "hidden"
    | "file"
    | "icon";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string;
  accept?: string;
  helpText?: string;
  preview?: boolean;
  previewUrl?: string;
}

interface ModalProps {
  title: string;
  fields: Field[];
  onSubmit: (
    formData: FormData,
  ) => Promise<{ success: boolean; error?: string }>;
  triggerButton: React.ReactNode;
  initialData?: any;
  isEdit?: boolean;
  idField?: string;
  bearerToken?: string;
  onFetchInitialData?: (id: string | number) => Promise<any>;
}

export default function Modal({
  title,
  fields,
  onSubmit,
  triggerButton,
  initialData,
  isEdit = false,
  idField = "id",
  bearerToken,
  onFetchInitialData,
}: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isImageValid, setIsImageValid] = useState<boolean>(true);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [openIconDropdown, setOpenIconDropdown] = useState<string | null>(null);
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [selectedIconCategory, setSelectedIconCategory] = useState<string>("all");
  const router = useRouter();

  // تهيئة الفورم عند الفتح
  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      if (!isOpen) return;

      if (initialData) {
        let currentData = initialData;

        if (isEdit && onFetchInitialData && initialData[idField]) {
          setFetchingData(true);
          try {
            const fetched = await onFetchInitialData(initialData[idField]);
            if (fetched && !isCancelled) {
              currentData = { ...initialData, ...fetched };
            }
          } catch (e) {
            console.error("Error fetching initial modal data:", e);
          } finally {
            if (!isCancelled) setFetchingData(false);
          }
        }

        if (isCancelled) return;

        const initialValues: Record<string, any> = {};
        fields.forEach((field) => {
          if (field.type === "file") {
            const imgVal = field.previewUrl && currentData[field.previewUrl]
              ? currentData[field.previewUrl]
              : currentData.image_url || currentData.image || null;
            if (imgVal) {
              setImagePreview(imgVal);
            }
            initialValues[field.name] = "";
          } else if (field.type === "textarea") {
            // For textarea fields, prioritize full content over short description
            initialValues[field.name] =
              currentData.content || currentData[field.name] || currentData.description || field.defaultValue || "";
          } else {
            const val = currentData[field.name];
            initialValues[field.name] =
              val !== undefined && val !== null
                ? val
                : (field.name === "title" ? currentData.name : field.name === "name" ? currentData.title : "") ||
                  field.defaultValue ||
                  "";
          }
        });
        setFormData(initialValues);
        setImageError(null);
        setIsImageValid(true);
        // Store existing image URL for reference
        if (currentData?.image_url || currentData?.image) {
          setExistingImageUrl(currentData.image_url || currentData.image);
        }
      } else {
        const emptyValues: Record<string, any> = {};
        fields.forEach((field) => {
          emptyValues[field.name] = field.defaultValue || "";
        });
        setFormData(emptyValues);
        setImagePreview(null);
        setSelectedFile(null);
        setImageError(null);
        setIsImageValid(true);
        setExistingImageUrl(null);
      }
    };

    init();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, initialData, fields, isEdit, onFetchInitialData, idField]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 200 * 1024; // 200 KB
      
      if (file.size > MAX_SIZE) {
        setImageError(`❌ حجم الصورة كبير جداً (${(file.size / 1024).toFixed(2)} KB). الحد الأقصى 200 KB`);
        setIsImageValid(false);
        setSelectedFile(null);
        setImagePreview(null);
        // Clear the file input
        e.target.value = '';
        return;
      }
      
      setImageError(null);
      setIsImageValid(true);
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setExistingImageUrl(null);
    setImageError(null);
    setIsImageValid(true);
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataObj = new FormData();

    Object.keys(formData).forEach((key) => {
      if (
        formData[key] !== undefined &&
        formData[key] !== null &&
        formData[key] !== ""
      ) {
        formDataObj.append(key, formData[key]);
      }
    });

    if (selectedFile) {
      formDataObj.append("image", selectedFile);
    }

    if (isEdit && initialData) {
      const idVal = initialData[idField]?.toString() || "";
      formDataObj.append("original_id", idVal);
      if (!formDataObj.has("id")) {
        formDataObj.append("id", idVal);
      }

      // Only append existing_image if we haven't deleted it
      if (existingImageUrl) {
        formDataObj.append("existing_image", existingImageUrl);
      }
    }

    if (bearerToken) {
      formDataObj.append("bearer_token", bearerToken);
    }

    const result = await onSubmit(formDataObj);

    if (result.success) {
      toast.success(isEdit ? "تم تحديث البيانات بنجاح" : "تمت الإضافة بنجاح");
      setIsOpen(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("data-mutated", { detail: { type: "all" } }));
        window.dispatchEvent(new Event("platforms-updated"));
        window.dispatchEvent(new Event("categories-updated"));
        window.dispatchEvent(new Event("themes-updated"));
        window.dispatchEvent(new Event("blogs-updated"));
      }
      router.refresh();
    } else {
      toast.error(result.error || `حدث خطأ أثناء ${isEdit ? "التعديل" : "الإضافة"}`);
      setError(
        result.error || `حدث خطأ أثناء ${isEdit ? "التعديل" : "الإضافة"}`,
      );
    }

    setLoading(false);
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="inline-block cursor-pointer"
      >
        {triggerButton}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`model relative bg-white rounded-3xl shadow-2xl w-full ${
              fields.some((f) => f.type === "icon" || f.type === "textarea")
                ? "max-w-2xl"
                : "max-w-md"
            } p-6 md:p-8 m-4 animate-fadeIn max-h-[92vh] overflow-y-auto`}
          >
            <div className="flex justify-between text-primary items-center mb-6">
              <h2 className="text-2xl text-primary/90 font-bold">{title}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:text-primary transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {imageError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {imageError}
              </div>
            )}

            {fetchingData ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-primary">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-500">جاري جلب البيانات من الخادم...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.name} className="text-right">
                  {/* ✅ حل مشكلة المقارنة - استخدام switch أو if منفصل */}
                  {field.type === "file" ? (
                    <div className="space-y-3">
                      <label className="block text-gray-700 font-semibold mb-2">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 mr-1">*</span>
                        )}
                      </label>

                      {(imagePreview || (isEdit && existingImageUrl)) && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">
                              معاينة الصورة:
                            </span>
                            <button
                              type="button"
                              onClick={handleDeleteImage}
                              className="text-red-500 hover:text-red-700 transition-colors py-1 px-2.5 hover:bg-red-50 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-red-200"
                              title="حذف الصورة"
                            >
                              <FaTimes size={13} />
                              <span>حذف الصورة</span>
                            </button>
                          </div>

                          <div className="relative w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center p-2">
                            <img
                              src={imagePreview || existingImageUrl || ''}
                              alt="Preview"
                              className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                            />
                          </div>
                        </div>
                      )}

                      <input
                        key={isImageValid ? 'valid' : 'invalid'}
                        type="file"
                        name={field.name}
                        accept={field.accept || "image/*"}
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary  outline-none transition-all"
                      />

                      {field.helpText && (
                        <p className="text-xs text-primary">{field.helpText}</p>
                      )}
                    </div>
                  ) : field.type === "icon" ? (
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        {field.label || "أيقونة القسم"}
                        {field.required && (
                          <span className="text-red-500 mr-1">*</span>
                        )}
                      </label>

                      <div className="space-y-3">
                        {/* زر العرض والفتح/الإغلاق */}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenIconDropdown(
                              openIconDropdown === field.name ? null : field.name
                            );
                            setIconSearchQuery("");
                          }}
                          className="w-full rounded-2xl px-4 py-3 border-2 border-gray-200 outline-none hover:border-primary/60 focus:border-primary transition-all flex items-center justify-between bg-gray-50/70 hover:bg-white cursor-pointer group text-right shadow-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:scale-105 transition-transform flex-shrink-0 shadow-xs border border-primary/20">
                              {resolveIcon(formData[field.name] || field.defaultValue || "icon-code")}
                            </div>
                            <div className="flex flex-col text-right min-w-0">
                              <span className="font-bold text-gray-850 text-sm truncate">
                                {(() => {
                                  const currentVal = formData[field.name] || field.defaultValue || "icon-code";
                                  const found = CATEGORY_ICONS.find(
                                    (opt) =>
                                      opt.value.toLowerCase() === String(currentVal).toLowerCase() ||
                                      opt.value.replace(/^icon-/, "").toLowerCase() === String(currentVal).replace(/^icon-/, "").toLowerCase()
                                  );
                                  return found ? found.label : (currentVal || "اختر أيقونة");
                                })()}
                              </span>
                              <span className="text-xs text-primary/80 font-mono font-medium" dir="ltr">
                                {formData[field.name] || field.defaultValue || "icon-code"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 group-hover:text-primary group-hover:border-primary/40 transition-colors shadow-2xs flex-shrink-0">
                            <span>{openIconDropdown === field.name ? "إغلاق الأيقونات" : "تغيير الأيقونة"}</span>
                            <FaChevronDown
                              size={12}
                              className={`transition-transform duration-200 ${
                                openIconDropdown === field.name ? "rotate-180 text-primary" : ""
                              }`}
                            />
                          </div>
                        </button>

                        <input
                          type="hidden"
                          name={field.name}
                          value={formData[field.name] || field.defaultValue || "icon-code"}
                        />

                        {/* لوحة اختيار الأيقونات المنسدلة الواسعة */}
                        {openIconDropdown === field.name && (
                          <div className="bg-gray-50/90 rounded-2xl border-2 border-primary/25 p-4 shadow-sm animate-fadeIn flex flex-col gap-3">
                            {/* شريط البحث وتعداد الأيقونات */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                              <div className="relative flex-1">
                                <FaSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <input
                                  type="text"
                                  value={iconSearchQuery}
                                  onChange={(e) => setIconSearchQuery(e.target.value)}
                                  placeholder="ابحث بالاسم أو الكود (كود، متجر، سيارة، ملابس، مطعم...)"
                                  className="w-full pr-10 pl-9 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-primary transition-all text-right shadow-2xs"
                                  autoFocus
                                />
                                {iconSearchQuery && (
                                  <button
                                    type="button"
                                    onClick={() => setIconSearchQuery("")}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                                  >
                                    <FaTimes size={11} />
                                  </button>
                                )}
                              </div>
                              <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap self-center px-2">
                                {
                                  CATEGORY_ICONS.filter((opt) => {
                                    if (iconSearchQuery.trim()) {
                                      const q = iconSearchQuery.toLowerCase().trim();
                                      return (
                                        opt.label.toLowerCase().includes(q) ||
                                        opt.value.toLowerCase().includes(q) ||
                                        (opt.keywords && opt.keywords.toLowerCase().includes(q))
                                      );
                                    }
                                    if (selectedIconCategory !== "all") {
                                      return opt.category === selectedIconCategory;
                                    }
                                    return true;
                                  }).length
                                } أيقونة متوفرة
                              </span>
                            </div>

                            {/* أزرار تصنيفات الأيقونات السريعة */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {ICON_CATEGORIES.map((cat) => {
                                const isCatActive = selectedIconCategory === cat.id && !iconSearchQuery;
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedIconCategory(cat.id);
                                      setIconSearchQuery("");
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                                      isCatActive
                                        ? "bg-primary text-white shadow-xs font-bold"
                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                  >
                                    {cat.label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* شبكة الأيقونات المتجاوبة (4 إلى 5 أعمدة) */}
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 overflow-y-auto max-h-72 p-1 custom-scrollbar">
                              {CATEGORY_ICONS.filter((opt) => {
                                if (iconSearchQuery.trim()) {
                                  const q = iconSearchQuery.toLowerCase().trim();
                                  return (
                                    opt.label.toLowerCase().includes(q) ||
                                    opt.value.toLowerCase().includes(q) ||
                                    (opt.keywords && opt.keywords.toLowerCase().includes(q))
                                  );
                                }
                                if (selectedIconCategory !== "all") {
                                  return opt.category === selectedIconCategory;
                                }
                                return true;
                              }).map((opt) => {
                                const currentVal = formData[field.name] || field.defaultValue || "icon-code";
                                const isSelected =
                                  String(currentVal).toLowerCase() === opt.value.toLowerCase() ||
                                  String(currentVal).replace(/^icon-/, "").toLowerCase() === opt.value.replace(/^icon-/, "").toLowerCase();

                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        [field.name]: opt.value,
                                      }));
                                      setOpenIconDropdown(null);
                                    }}
                                    className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl text-center transition-all cursor-pointer border group ${
                                      isSelected
                                        ? "bg-primary/10 border-primary text-primary font-bold shadow-xs ring-2 ring-primary/20 scale-[1.02]"
                                        : "bg-white border-gray-200 hover:bg-primary/5 hover:border-primary/50 text-gray-700 hover:scale-[1.03] shadow-2xs"
                                    }`}
                                    title={`${opt.label} (${opt.value})`}
                                  >
                                    {isSelected && (
                                      <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] shadow-xs">
                                        <FaCheck />
                                      </span>
                                    )}
                                    <div
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl mb-1.5 transition-transform group-hover:scale-110 flex-shrink-0 ${
                                        isSelected
                                          ? "bg-primary text-white"
                                          : "bg-gray-50 text-primary group-hover:bg-primary/10 border border-gray-100"
                                      }`}
                                    >
                                      {opt.icon}
                                    </div>
                                    <span className="text-xs truncate w-full font-semibold">
                                      {opt.label}
                                    </span>
                                    <span
                                      className="text-[10px] text-gray-400 font-mono truncate w-full mt-0.5"
                                      dir="ltr"
                                    >
                                      {opt.value}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : field.type === "hidden" ? (
                    <input
                      type="hidden"
                      name={field.name}
                      value={formData[field.name] || field.defaultValue || ""}
                    />
                  ) : field.type === "select" ? (
                    <>
                      <label className="block text-gray-700 font-semibold mb-2">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 mr-1">*</span>
                        )}
                      </label>
                      <select
                        name={field.name}
                        required={field.required}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className="w-full rounded-xl px-5 py-3.5 border-2 border-gray-200 outline-none transition-all cursor-pointer"
                      >
                        <option value="">اختر {field.label}</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : field.type === "textarea" ? (
                    <>
                      <label className="block text-gray-700 font-semibold mb-2">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 mr-1">*</span>
                        )}
                      </label>
                    <RichTextEditor
                      key={`${field.name}-${initialData?.[idField] || "new"}`}
                      value={formData[field.name] || ""}
                      onChange={(v) => setFormData(prev => ({ ...prev, [field.name]: v }))}
                      placeholder={field.placeholder}
                    />
                    </>
                  ) : (
                    // text, email, password
                    <>
                      <label className="block text-gray-700 font-semibold mb-2">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 mr-1">*</span>
                        )}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        required={field.required}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        dir={field.type === "email" ? "ltr" : "rtl"}
                        className="w-full rounded-xl px-5 py-3.5 border-2 border-gray-200 outline-none focus:border-primary transition-all"
                      />
                    </>
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || !isImageValid}
                  className="flex-1 bg-primary hover:bg-primary/80 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>
                        {isEdit ? "جاري التحديث..." : "جاري الإضافة..."}
                      </span>
                    </>
                  ) : (
                    <span>{isEdit ? "تحديث" : "إضافة"}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
