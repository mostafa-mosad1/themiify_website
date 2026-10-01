/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ProductCard Component
 *
 * A reusable, accessible product card component for e-commerce applications.
 * Built with Next.js, TypeScript, and follows SOLID principles for maintainability.
 *
 * @version 1.0.0
 */

"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { BsEye } from "react-icons/bs";
import { CiFileOn } from "react-icons/ci";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBin6Line } from "react-icons/ri";
import { resolveIcon } from "@/lib/utils/iconMap";
import "./ThemeCard.css";

interface ThemeDemo {
  id: string | number;
  icon_name?: string | null;
  icon?: string | null;
  url: string;
  image_url?: string | null;
  image?: string | null;
  order?: number;
  display_order?: number;
  playlist_link?: string;
  youtube_link?: string;
}


interface ProductCardProps {
  id: string | number;

  name: string;

  imageUrl: string;

  price: number | string;

  categoryName?: string;

  platformName?: string;

  userGuideUrl: string;

  previewLink?: string;

  buyLink?: string;

  demos?: ThemeDemo[];

  playlistLink?: string;

  youtubeLink?: string;

  onPreview?: () => void;

  onDelete?: (id: string | number) => Promise<any>;

  onEdit?: (id: string | number) => void;

  onBuy?: () => void;

  imageAlt?: string;

  className?: string;

  imageWidth?: number;

  imageHeight?: number;

  showActions?: boolean;

  isVisible?: boolean;

  onToggleVisibility?: (id: string | number, newState: boolean) => Promise<any>;

  /**  */
  author?: string;
}

/**
 * Format price with SAR currency
 * Single Responsibility: Dedicated function for price formatting
 */
const formatPrice = (amount: number | string | undefined | null): string => {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  return isNaN(num) ? "0.00 " : `${num.toFixed(2)} `;
};

/**
 * Truncate product name if it exceeds recommended length
 * Ensures UI consistency across different product names
 */
const truncateName = (text: string, maxLength: number = 20): string => {
  return text.length > maxLength
    ? `${text.substring(0, maxLength)}...`
    : text;
};

/**
 * ProductCard Component
 *
 * A self-contained product card that displays product information
 * and provides interaction buttons for preview and purchase.
 *
 * Single Responsibility: This component only handles product card presentation.
 * Open/Closed: Extensible through props without modifying the core component.
 *
 * @example
 * ```tsx
 * <ProductCard
 *   id="product-123"
 *   name="سماعات لاسلكية"
 *   imageUrl="/products/headphones.jpg"
 *   price={299.99}
 *   userGuideUrl="/guides/headphones.pdf"
 *   onPreview={() => console.log('Preview clicked')}
 *   onBuy={() => console.log('Buy clicked')}
 * />
 * ```
 */
const ThemeCard: React.FC<ProductCardProps> = ({
  id,
  name,
  imageUrl,
  price,
  demos = [],
  previewLink, // ✅ إضافة
  buyLink, // ✅ إضافة
  onDelete,
  onEdit,
  imageAlt,
  className = "",
  imageWidth = 300,
  imageHeight = 300,
  showActions = false,
  isVisible = true,
  onToggleVisibility,
  author,
}) => {
  const router = useRouter();

  // Sort demos by order
  const sortedDemos = useMemo(() => {
    let list = demos;
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        list = [];
      }
    }
    if (list && Array.isArray(list) && list.length > 0) {
      return [...list].sort(
        (a, b) =>
          (a.order ?? a.display_order ?? 0) - (b.order ?? b.display_order ?? 0),
      );
    }
    return [];
  }, [demos]);

  const [activeDemoId, setActiveDemoId] = useState<string | number | null>(null);

  const activeDemo = useMemo(() => {
    if (sortedDemos.length === 0) return null;
    const found = sortedDemos.find((d) => d.id === activeDemoId);
    return found || sortedDemos[0];
  }, [sortedDemos, activeDemoId]);

  const activeId = activeDemo?.id;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Visibility toggle state ──────────────────────────────
  const [visible, setVisible] = useState<boolean>(isVisible);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);

  const handleToggleVisibility = async () => {
    if (isTogglingVisibility) return;
    const newState = !visible;
    setVisible(newState);
    if (onToggleVisibility) {
      setIsTogglingVisibility(true);
      try {
        await onToggleVisibility(id, newState);
      } catch {
        // revert on error
        setVisible(!newState);
      } finally {
        setIsTogglingVisibility(false);
      }
    }
  };

  const detailUrl = useMemo(() => {
    return author === "admin"
      ? `/admin/themes/${id}`
      : `/themes/${id}`;
  }, [author, id]);

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    setIsDeleting(true);
    await onDelete(id);
    setIsDeleting(false);
    setShowConfirm(false);
  };

  // Navigate to the dedicated edit page for this theme.
  // If the parent passes a custom onEdit handler, use it;
  // otherwise fall back to the standard /admin/themes/edit/<id> route.
  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    } else {
      router.push(`/admin/themes/edit/${id}`);
    }
  };

  // Swap image, preview link and buy link when a demo is active
  const currentImage = activeDemo?.image_url || activeDemo?.image || activeDemo?.imageUrl || imageUrl;
  const previewUrl = (activeDemo?.url || activeDemo?.link || activeDemo?.demo_url || previewLink || "").trim();
  const currentBuyLink = (activeDemo?.buy_link || activeDemo?.buyLink || activeDemo?.buy_url || activeDemo?.purchase_url || buyLink || "").trim();

  // In client view: if the theme is hidden, don't render at all
  if (author !== "admin" && !visible) return null;

  return (
    <section
      className={`product-card ${className}`}
      data-product-id={id}
      style={author === "admin" && !visible ? { opacity: 0.45, filter: "grayscale(60%)" } : undefined}
    >
      <div className="product-card__image-wrapper">
        <Link href={detailUrl}>
        <Image
          src={currentImage}
          alt={
            activeDemo
              ? `معاينة: ${activeDemo.icon_name || activeDemo.icon || name}`
              : imageAlt || name
          }
          width={imageWidth}
          height={imageHeight}
          className="product-card__image h-full !object-contain w-full"
          loading="eager"
        />
        </Link> 

        {/* ✅ إظهار أزرار التعديل والحذف والإخفاء فقط إذا showActions = true */}
        {showActions && (
          <div className="flex gap-2 absolute top-2 right-2 flex-row-reverse">
            {/* Edit button */}
            <button
              onClick={handleEdit}
              className="product-card__edit-btn w-10 h-10 rounded-full flex items-center justify-center text-green-600 bg-green-300/40 transition-all duration-300 ease-in-out"
              aria-label="تعديل الثيم"
              title="تعديل الثيم"
            >
              <AiOutlineEdit size={26} />
            </button>

            {/* Delete button */}
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              className="product-card__delete-btn w-10 h-10 rounded-full flex items-center justify-center text-[#C90000] bg-[#c900006a] transition-all duration-300 ease-in-out"
              aria-label="حذف الثيم"
              title="حذف الثيم"
            >
              <RiDeleteBin6Line size={23} />
            </button>

          
          </div>
        )}

        {/* Confirmation modal */}
        {showConfirm && (
          <div className="confirm-overlay" role="dialog" aria-modal="true">
            <div className="confirm-box">
              <div className="confirm-icon">🗑️</div>
              <p className="confirm-title">حذف الثيم</p>
              <p className="confirm-msg">
                هل أنت متأكد من حذف <strong>{name}</strong>؟ لا يمكن التراجع عن
                هذا الإجراء.
              </p>
              <div className="confirm-actions">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="confirm-btn confirm-btn--danger"
                >
                  {isDeleting ? (
                    <span className="product-card__delete-spinner" />
                  ) : (
                    "نعم، احذف"
                  )}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="confirm-btn confirm-btn--cancel"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Information Section */}
      <div className="product-card__content">
        {/* Name row: theme name + demo icon buttons */}
        <div className="product-card__name-row">
          <h3 className="product-card__name text-xl font-bold !text-black" title={name}>
            {truncateName(name, 20)}
          </h3>

          {sortedDemos.length > 0 && (
            <div className="product-card__demos flex items-center gap-1.5 flex-wrap" aria-label="نماذج الثيم">
              {sortedDemos.map((rawDemo, idx) => {
                const demo = rawDemo as any;
                const isActive = activeId === demo.id;
                const demoIconName = demo.icon_name || demo.iconName || demo.icon;
                const demoImg = demo.image_url || demo.imageUrl || demo.image || demo.icon_url || demo.iconUrl;
                const hasImg =
                  demoImg &&
                  typeof demoImg === "string" &&
                  (demoImg.startsWith("http") || demoImg.startsWith("/"));

                return (
                  <button
                    type="button"
                    key={demo.id || idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDemoId(demo.id);
                    }}
                    title={`اختيار ${demoIconName || `ديمو ${idx + 1}`}`}
                    aria-label={`اختيار ديمو ${demoIconName || idx + 1}`}
                    className={`product-card__demo-btn relative size-8 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-200 dark:border-zinc-700 cursor-pointer bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-sm ${
                      isActive
                        ? "scale-110 shadow-md ring-0"
                        : "hover:bg-zinc-100 hover:scale-105"
                    }`}
                  >
                    {/* مساحة الصورة / الأيقونة في المنتصف */}
                    <div className="w-full h-full rounded-full flex items-center justify-center p-1.5 overflow-hidden">
                      {hasImg ? (
                        <img
                          src={demoImg}
                          alt={demoIconName || "demo icon"}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs flex items-center justify-center">
                          {resolveIcon(demoIconName)}
                        </span>
                      )}
                    </div>

                    {/* القوس السفلي المسحوب بانسيابية على الإطار الخارجي */}
                    <svg
                      className="absolute inset-0 w-[calc(100%+1px)] h-[calc(100%+2px)] pointer-events-none overflow-visible"
                      viewBox="0 0 34 34"
                      fill="none"
                    >
                      <defs>
                        <linearGradient
                          id={`taper-arc-${id}-${idx}`}
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="var(--primary-color, #ea580c)" stopOpacity="0" />
                          <stop offset="15%" stopColor="var(--primary-color, #ea580c)" stopOpacity="0.8" />
                          <stop offset="35%" stopColor="var(--primary-color, #ea580c)" stopOpacity="1" />
                          <stop offset="65%" stopColor="var(--primary-color, #ea580c)" stopOpacity="1" />
                          <stop offset="85%" stopColor="var(--primary-color, #ea580c)" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="var(--primary-color, #ea580c)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 3.5 23.5 A 16 16 0 0 0 30.5 23.5"
                        stroke={`url(#taper-arc-${id}-${idx})`}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Price */}
        <p
          className="product-card__price text-black dark:text-white "
          aria-label={`السعر: ${formatPrice(price)}`}
        >
          <span className="text-md font-bold">{formatPrice(price)}</span>
          <span className="text-xs font-bold">ريال سعودي</span>
        </p>

        {/* User Guide Link */}

        <div className="flex items-center gap-1">
          <CiFileOn fontSize={20} />
          <Link
            href={detailUrl}
            className="product-card__guide-link underline text-sm font-semibold text-black dark:text-white"
            aria-label="فتح دليل المستخدم"
          >
            دليل المستخدم
          </Link>
        </div>



        {/* Action Buttons Container */}
        <div className="product-card__actions">
          {/* Preview Button */}
          <Button
            url={previewUrl}
            openInNewTab={!!previewUrl}
            icon={<BsEye />}
            className="product-card__button product-card__button--preview justify-center w-1/2 hover:scale-95 transition-transform duration-200"
            ariaLabel="معاينة المنتج"
          >
            <span className="text-nowrap">معاينة</span>
          </Button>

          {/* Buy Button */}
          <Button
            variant="solid"
            url={currentBuyLink}
            openInNewTab={!!currentBuyLink}
            className="product-card__button product-card__button--buy flex items-center justify-center text-primary buyCardBtn w-1/2 hover:scale-95 transition-transform duration-200"
            ariaLabel="شراء المنتج الآن"
          >
            <span className="text-primary text-nowrap">اشتري الآن</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

ThemeCard.displayName = "ThemeCard";

export default ThemeCard;
