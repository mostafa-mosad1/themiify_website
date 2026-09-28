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
  icon_name: string;
  url: string;
  image_url: string;
  order: number;
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

  // Sort demos by order; track which one is active (first demo is active by default)
  const sortedDemos = useMemo(() => {
    return [
      { id, icon_name: "", url: previewLink ?? "", image_url: imageUrl, order: 0 },
      ...demos,
    ].sort((a, b) => a.order - b.order);
  }, [id, previewLink, imageUrl, demos]);

  const [activeDemoId, setActiveDemoId] = useState<string | number | null>(
    sortedDemos.length > 0 ? sortedDemos[0].id : null,
  );

  const activeDemo = useMemo(
    () => sortedDemos.find((d) => d.id === activeDemoId) ?? null,
    [sortedDemos, activeDemoId]
  );
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

  const handleDemoClick = (demo: ThemeDemo) =>
    setActiveDemoId((prev) => (prev === demo.id ? null : demo.id));

  // Swap image and preview link when a demo is active
  const currentImage = activeDemo?.image_url || imageUrl;
  const previewUrl = activeDemo?.url || previewLink;

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
            activeDemo ? `معاينة: ${activeDemo.icon_name}` : imageAlt || name
          }
          width={imageWidth}
          height={imageHeight}
          className="product-card__image h-full object-cover w-full"
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

          {sortedDemos.length > 1 && (
            <div className="product-card__demos" aria-label="نماذج الثيم">
              {sortedDemos.map((demo) => {
                const isActive = activeDemoId === demo.id;
                return (
                  <Button
                    variant="solid"
                    solidColor="#ffffff"
                    key={demo.id}
                    onClick={() => handleDemoClick(demo)}
                    icon={resolveIcon(demo.icon_name)}
                    className={`product-card__demo-btn size-8 !gap-0  flex justify-center items-center  demoBtn  ${isActive ? "!text-white !bg-primary" : "!text-black dark:!text-white !bg-transparent"}`}
                  >
                    {""}
                  </Button>
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
            url={buyLink}
            openInNewTab={!!buyLink}
            className="product-card__button product-card__button--buy flex items-center justify-center text-primary buyCardBtn w-1/2 hover:scale-95 transition-transform duration-200"
            aria-label="شراء المنتج الآن"
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
