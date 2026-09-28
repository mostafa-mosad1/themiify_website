import React from "react";
import { MdCategory } from "react-icons/md";
import { FaClock } from "react-icons/fa";
import type { ICategory } from "./types";

export function formatCategoryDate(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}

export const categoryTableColumns = [
  { key: "id", label: "ID", type: "text" as const },
  { key: "icon", label: "الأيقونة", type: "icon" as const },
  { key: "name", label: "اسم القسم", type: "text" as const },
  { key: "created_at", label: "تاريخ الإنشاء", type: "text" as const },
  { key: "actions", label: "الإجراءات", type: "actions" as const },
];

export const categoryAddFields = [
  {
    name: "name",
    label: "اسم القسم / التصنيف",
    type: "text" as const,
    required: true,
    placeholder: "مثال: قسم البرمجيات",
  },
  {
    name: "icon",
    label: "أيقونة القسم",
    type: "icon" as const,
    required: true,
    defaultValue: "icon-code",
  },
];

export const categoryEditFields = [
  {
    name: "name",
    label: "اسم القسم / التصنيف",
    type: "text" as const,
    required: true,
    placeholder: "مثال: قسم البرمجيات",
  },
  {
    name: "icon",
    label: "أيقونة القسم",
    type: "icon" as const,
    required: true,
    defaultValue: "icon-code",
  },
];

export function formatCategories(categories: ICategory[] = []) {
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name || "بدون اسم",
    icon: cat.icon || "icon-code",
    image: cat.image_url || cat.image || null,
    image_url: cat.image_url || cat.image || null,
    created_at: formatCategoryDate(cat.created_at),
  }));
}

export function formatCategoriesForEdit(categories: ICategory[] = []) {
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name || "",
    icon: cat.icon || "icon-code",
  }));
}

export function getCategoryStats(categories: ICategory[] = [], total?: number) {
  return [
    {
      label: "إجمالي الأقسام",
      value: total ?? categories.length,
      icon: <MdCategory className="text-primary text-2xl" />,
      color: "primary",
    },
    {
      label: "آخر تحديث",
      value:
        categories && categories.length > 0
          ? formatCategoryDate(categories[0].created_at)
          : "لا يوجد",
      icon: <FaClock className="text-green-500 text-2xl" />,
      color: "green",
    },
  ];
}
