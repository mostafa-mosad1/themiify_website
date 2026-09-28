"use client";

import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaCalendar,
  FaTag,
  FaExternalLinkAlt,
  FaEnvelope,
  FaUser,
  FaLink,
  FaClock,
  FaShieldAlt,
  FaIdBadge,
} from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { Column } from "./TablePage";
import { cleanAndFormatBlogContent } from "@/lib/utils";

interface ViewDetailsModalProps {
  title: string;
  triggerButton: React.ReactNode;
  item: any;
  idKey?: string;
  columns?: Column[];
  onFetchItem?: (id: string | number) => Promise<any>;
}

export default function ViewDetailsModal({
  title,
  triggerButton,
  item,
  idKey = "id",
  columns = [],
  onFetchItem,
}: ViewDetailsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(item);

  useEffect(() => {
    let isCancelled = false;

    const loadDetails = async () => {
      if (!isOpen) return;

      const itemId = item[idKey];
      if (onFetchItem && itemId) {
        setLoading(true);
        try {
          const res = await onFetchItem(itemId);
          if (res && !isCancelled) {
            setDetails({ ...item, ...res });
          }
        } catch (err) {
          console.error("Error loading item details for view modal:", err);
          if (!isCancelled) setDetails(item);
        } finally {
          if (!isCancelled) setLoading(false);
        }
      } else {
        setDetails(item);
      }
    };

    loadDetails();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, item, idKey, onFetchItem]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const currentItem = details || item;
  const itemTitle =
    currentItem.title ||
    currentItem.name ||
    currentItem.email ||
    currentItem.username ||
    `العنصر #${currentItem[idKey] || ""}`;

  const rawImage = currentItem.image_url || currentItem.image;
  const imageUrl =
    typeof rawImage === "string" &&
    !rawImage.includes("[object") &&
    rawImage.trim() !== ""
      ? rawImage.trim()
      : null;

  const rawContent =
    currentItem.content ||
    currentItem.description ||
    currentItem.body ||
    "";

  const contentHtml = cleanAndFormatBlogContent(rawContent);

  const categoryName =
    typeof currentItem.category === "object" && currentItem.category !== null
      ? currentItem.category.name
      : currentItem.category || currentItem.category_name || null;

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="inline-block cursor-pointer"
      >
        {triggerButton}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Box */}
          <div className="relative bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col z-10 border border-[var(--border-color)] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {title}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-[var(--bg-tertiary)]"
                title="إغلاق"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    جاري تحميل تفاصيل المقال...
                  </p>
                </div>
              ) : (
                <>
                  {/* Image Banner */}
                  {imageUrl && (
                    <div className="relative w-full h-56 md:h-64 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-[var(--border-color)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={itemTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Title & Metadata Badges */}
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-3 leading-snug">
                      {itemTitle}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {currentItem.is_super_admin !== undefined && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium border ${
                          currentItem.is_super_admin
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        }`}>
                          <FaShieldAlt size={11} />
                          <span>{currentItem.is_super_admin ? "سوبر أدمن" : "أدمن"}</span>
                        </span>
                      )}

                      {categoryName && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                          <FaTag size={11} />
                          <span>{categoryName}</span>
                        </span>
                      )}

                      {currentItem.created_at && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                          <FaCalendar size={11} />
                          <span>{formatDate(currentItem.created_at)}</span>
                        </span>
                      )}

                      {currentItem.email && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                          <FaEnvelope size={11} />
                          <span dir="ltr">{currentItem.email}</span>
                        </span>
                      )}

                      {currentItem.role && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-medium">
                          <FaUser size={11} />
                          <span>{currentItem.role}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Account / Admin Details Card */}
                  {(currentItem.is_super_admin !== undefined || (currentItem.email && !contentHtml)) && (
                    <div className="bg-[var(--bg-secondary)]/40 rounded-2xl p-5 border border-[var(--border-color)] space-y-4">
                      <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <MdAdminPanelSettings size={18} className="text-primary" />
                        <span>بيانات الحساب</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                          <span className="text-xs text-[var(--text-tertiary)] block mb-1">المعرف (ID)</span>
                          <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                            #{currentItem.id || currentItem[idKey] || "-"}
                          </span>
                        </div>
                        <div className="p-3.5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                          <span className="text-xs text-[var(--text-tertiary)] block mb-1">البريد الإلكتروني</span>
                          <span className="text-sm font-semibold text-[var(--text-primary)] break-all" dir="ltr">
                            {currentItem.email || "-"}
                          </span>
                        </div>
                        <div className="p-3.5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                          <span className="text-xs text-[var(--text-tertiary)] block mb-1">نوع الحساب / الصلاحية</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            currentItem.is_super_admin
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200"
                          }`}>
                            {currentItem.is_super_admin ? "سوبر أدمن (Super Admin)" : "أدمن عادي (Admin)"}
                          </span>
                        </div>
                        <div className="p-3.5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                          <span className="text-xs text-[var(--text-tertiary)] block mb-1">تاريخ الإنشاء</span>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {formatDate(currentItem.created_at)}
                          </span>
                        </div>
                        {currentItem.updated_at && (
                          <div className="p-3.5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] sm:col-span-2">
                            <span className="text-xs text-[var(--text-tertiary)] block mb-1">تاريخ آخر تحديث</span>
                            <span className="text-sm text-[var(--text-secondary)]">
                              {formatDate(currentItem.updated_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content / Description */}
                  {contentHtml && (
                    <div className="bg-[var(--bg-secondary)]/30 rounded-2xl p-5 border border-[var(--border-color)]">
                      <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                        المحتوى والوصف
                      </h4>
                      <div
                        className="text-[var(--text-primary)] text-sm md:text-base leading-relaxed prose prose-sm max-w-none break-words"
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                      />
                    </div>
                  )}

                  {/* External Links */}
                  {(currentItem.inspect_link ||
                    currentItem.buy_link ||
                    currentItem.video_link ||
                    currentItem.link ||
                    currentItem.url) && (
                    <div className="bg-[var(--bg-secondary)]/30 rounded-2xl p-4 border border-[var(--border-color)]">
                      <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                        الروابط المرفقة
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentItem.inspect_link && (
                          <a
                            href={currentItem.inspect_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-primary text-sm font-medium text-primary hover:shadow-sm transition-all"
                          >
                            <FaExternalLinkAlt size={12} />
                            <span>رابط المعاينة</span>
                          </a>
                        )}
                        {currentItem.buy_link && (
                          <a
                            href={currentItem.buy_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-primary text-sm font-medium text-primary hover:shadow-sm transition-all"
                          >
                            <FaExternalLinkAlt size={12} />
                            <span>رابط الشراء</span>
                          </a>
                        )}
                        {currentItem.video_link && (
                          <a
                            href={currentItem.video_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-primary text-sm font-medium text-primary hover:shadow-sm transition-all"
                          >
                            <FaExternalLinkAlt size={12} />
                            <span>رابط الفيديو</span>
                          </a>
                        )}
                        {(currentItem.link || currentItem.url) && (
                          <a
                            href={currentItem.link || currentItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-primary text-sm font-medium text-primary hover:shadow-sm transition-all"
                          >
                            <FaLink size={12} />
                            <span>الرابط الخارجي</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-medium text-sm transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
