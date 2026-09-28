import React from "react";
import { MdHistory } from "react-icons/md";
import { FaClock, FaUser, FaTags } from "react-icons/fa";
import type { ILog } from "./types";
import type { IAdminAccount } from "@/features/admins/types";

export function formatLogDate(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

export const logTableColumns = [
  { key: "id", label: "ID", type: "text" as const },
  {
    key: "action_type_label",
    label: "نوع الإجراء",
    type: "badge" as const,
    badgeColors: {
      إضافة: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200",
      تعديل: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200",
      حذف: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200",
    },
  },
  { key: "title", label: "عنوان العملية", type: "text" as const },
  { key: "description", label: "التفاصيل", type: "text" as const },
  { key: "tags_display", label: "الوسوم / المنصة", type: "text" as const },
  {
    key: "admin_name",
    label: "المشرف / المنفذ",
    type: "text" as const,
    render: (value: any, item: any) => (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs border border-[var(--border-color)]">
        <FaUser className="text-primary text-[10px] shrink-0" />
        <span className="font-semibold text-[var(--text-secondary)] text-[10px]">
          مشرف:
        </span>
        <span
          dir={item.admin_email?.includes("@") || value?.includes("@") ? "ltr" : "rtl"}
          className="font-medium text-[var(--text-primary)]"
        >
          {value}
        </span>
        {item.is_super_admin && (
          <span className="inline-block px-1.5 py-0.2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded-full border border-purple-200/50">
            سوبر
          </span>
        )}
      </div>
    ),
  },
  { key: "created_at", label: "التاريخ", type: "text" as const },
];

export function formatLogs(
  logs: ILog[] = [],
  adminsMap: Map<number | string, IAdminAccount> = new Map()
) {
  return logs.map((log: ILog, index: number) => {
    const actionTypeObj =
      typeof log.action_type === "object" && log.action_type !== null
        ? log.action_type
        : null;

    const actionTypeLabel =
      actionTypeObj?.label ||
      (log.action?.includes("create")
        ? "إضافة"
        : log.action?.includes("delete")
        ? "حذف"
        : "تعديل");

    const adminId = log.admin?.id;
    const adminAccount = adminId
      ? adminsMap.get(Number(adminId)) || adminsMap.get(String(adminId))
      : null;

    const resolvedEmail =
      (adminAccount?.email && adminAccount.email.trim() !== "" ? adminAccount.email : null) ||
      (log.user_email && log.user_email.trim() !== "" ? log.user_email : null) ||
      (log.admin?.name && log.admin.name.includes("@") ? log.admin.name : null);

    const adminDisplayName = resolvedEmail
      ? resolvedEmail
      : log.admin?.name && !log.admin.name.startsWith("مشرف #")
      ? log.admin.name
      : adminId
      ? `مشرف #${adminId}`
      : log.user_id || "النظام";

    const tagsStr =
      Array.isArray(log.tags) && log.tags.length > 0
        ? log.tags.join(" | ")
        : log.target_type || "-";

    return {
      id: String(log.id || `log-${index}`),
      title: log.title || log.description || log.action || "-",
      action_type_label: actionTypeLabel,
      description: log.description || log.title || "-",
      tags_display: tagsStr,
      admin_name: adminDisplayName,
      admin_email: resolvedEmail,
      is_super_admin: Boolean(adminAccount?.is_super_admin),
      created_at: formatLogDate(log.created_at),
    };
  });
}

export function getLogStats(logs: ILog[] = [], totalLogs?: number) {
  const total = totalLogs ?? logs.length;
  const lastActivity =
    logs && logs.length > 0 ? formatLogDate(logs[0].created_at) : "لا يوجد";

  const activeAdmins =
    new Set(
      logs?.map((l) => l.admin?.id || l.user_email || l.user_id).filter(Boolean)
    ).size || 1;

  const allTags =
    new Set(
      logs?.flatMap((l) => l.tags || (l.target_type ? [l.target_type] : [])).filter(Boolean)
    ).size || 1;

  return [
    {
      label: "إجمالي السجلات",
      value: total,
      icon: <MdHistory className="text-primary text-2xl" />,
      color: "primary",
    },
    {
      label: "آخر نشاط مسجل",
      value: lastActivity,
      icon: <FaClock className="text-green-500 text-2xl" />,
      color: "green",
    },
    {
      label: "عدد المشرفين النشطين",
      value: activeAdmins,
      icon: <FaUser className="text-blue-500 text-2xl" />,
      color: "blue",
    },
    {
      label: "التصنيفات والمنصات",
      value: allTags,
      icon: <FaTags className="text-purple-500 text-2xl" />,
      color: "purple",
    },
  ];
}
