import React from "react";
import { FaGlobe, FaClock } from "react-icons/fa";
import type { IPlatform } from "./types";

export function formatPlatformDate(dateString?: string): string {
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

export const platformTableColumns = [
  { key: "id", label: "ID", type: "text" as const },
  { key: "name", label: "اسم المنصة", type: "text" as const },
  { key: "created_at", label: "تاريخ الإنشاء", type: "text" as const },
  { key: "actions", label: "الإجراءات", type: "actions" as const },
];

export const platformAddFields = [
  {
    name: "name",
    label: "اسم المنصة",
    type: "text" as const,
    required: true,
    placeholder: "مثال: Salla أو Zid أو Shopify",
  },
];

export const platformEditFields = [
  {
    name: "name",
    label: "اسم المنصة",
    type: "text" as const,
    required: true,
    placeholder: "مثال: Salla أو Zid أو Shopify",
  },
];

export function formatPlatforms(platforms: IPlatform[] = []) {
  return platforms.map((p) => ({
    id: p.id,
    name: p.name || "بدون اسم",
    created_at: formatPlatformDate(p.created_at),
  }));
}

export function formatPlatformsForEdit(platforms: IPlatform[] = []) {
  return platforms.map((p) => ({
    id: p.id,
    name: p.name || "",
  }));
}

export function getPlatformStats(platforms: IPlatform[] = [], total?: number) {
  return [
    {
      label: "إجمالي المنصات",
      value: total ?? platforms.length,
      icon: <FaGlobe className="text-primary text-2xl" />,
      color: "primary",
    },
    {
      label: "آخر تحديث",
      value:
        platforms && platforms.length > 0
          ? formatPlatformDate(platforms[0].created_at)
          : "لا يوجد",
      icon: <FaClock className="text-green-500 text-2xl" />,
      color: "green",
    },
  ];
}
