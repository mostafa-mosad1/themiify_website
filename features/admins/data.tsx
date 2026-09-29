import React from "react";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaClock, FaUsersCog, FaUserShield } from "react-icons/fa";
import type { IAdminAccount } from "./types";
import type { Activity } from "@/types/theme.types";

export function formatAdminDate(dateString?: string): string {
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

// ─── إعدادات جدول الحسابات ───────────────────────────────────

export const adminAccountsTableColumns = [
  { key: "id", label: "ID", type: "text" as const },
  { key: "email", label: "البريد الإلكتروني", type: "email" as const },
  {
    key: "role_display",
    label: "الصلاحية",
    type: "badge" as const,
    badgeColors: {
      "سوبر أدمن":
        "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200",
      أدمن:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200",
    },
  },
  { key: "created_at", label: "تاريخ الإنشاء", type: "date" as const },
  { key: "actions", label: "الإجراءات", type: "actions" as const },
];

export const adminAccountAddFields = [
  {
    name: "email",
    label: "البريد الإلكتروني",
    type: "email" as const,
    required: true,
    placeholder: "admin@themiify.com",
  },
  {
    name: "password",
    label: "كلمة المرور",
    type: "password" as const,
    required: true,
    placeholder: "••••••••",
  },
];

export const adminAccountEditFields = [
  {
    name: "email",
    label: "البريد الإلكتروني",
    type: "email" as const,
    required: true,
    placeholder: "admin@themiify.com",
  },
];

export function formatAdminAccounts(admins: IAdminAccount[] = []) {
  return admins.map((account) => ({
    id: account.id,
    email: account.email,
    is_super_admin: account.is_super_admin,
    role_display: account.is_super_admin ? "سوبر أدمن" : "أدمن",
    created_at: account.created_at,
    updated_at: account.updated_at,
  }));
}

export function formatAdminAccountsForEdit(admins: IAdminAccount[] = []) {
  return admins.map((account) => ({
    id: account.id,
    original_id: account.id,
    email: account.email,
  }));
}

export function getAdminAccountsStats(admins: IAdminAccount[] = [], total?: number) {
  const totalAdmins = total ?? admins.length;
  const superAdminsCount = admins.filter((a) => a.is_super_admin).length;
  const regularAdminsCount = admins.filter((a) => !a.is_super_admin).length;

  return [
    {
      label: "إجمالي الحسابات",
      value: totalAdmins,
      icon: <MdAdminPanelSettings className="text-primary text-2xl" />,
      color: "primary",
    },
    {
      label: "سوبر أدمن",
      value: superAdminsCount,
      icon: <FaUserShield className="text-purple-500 text-2xl" />,
      color: "purple",
    },
    {
      label: "أدمن عادي",
      value: regularAdminsCount,
      icon: <FaUsersCog className="text-blue-500 text-2xl" />,
      color: "blue",
    },
    {
      label: "آخر إضافة",
      value:
        admins && admins.length > 0
          ? formatAdminDate(admins[0].created_at)
          : "لا يوجد",
      icon: <FaClock className="text-green-500 text-2xl" />,
      color: "green",
    },
  ];
}

// ─── إعدادات وبيانات لوحة التحكم الرئيسية (Dashboard) ─────────

export interface DashboardQuickAction {
  title: string;
  href: string;
  type: "theme" | "essay" | "support";
}

export const dashboardQuickActions: DashboardQuickAction[] = [
  {
    title: "+ إضافة ثيم جديد",
    href: "/admin/themes",
    type: "theme",
  },
  {
    title: "+ إضافة مقالة",
    href: "/admin/essays",
    type: "essay",
  },
  {
    title: "+ إضافة بيانات الدعم",
    href: "/admin/support",
    type: "support",
  },
];

export function formatDashboardActivities(
  logs: any[] = [],
  adminsMap: Map<number | string, IAdminAccount> = new Map()
): Activity[] {
  return logs.map((log: any, index: number) => {
    const actionTypeObj =
      typeof log.action_type === "object" && log.action_type !== null
        ? log.action_type
        : null;

    const actionLabel =
      actionTypeObj?.label ||
      (log.action?.includes("create")
        ? "إضافة"
        : log.action?.includes("delete")
        ? "حذف"
        : "تعديل");

    const actionColor =
      actionTypeObj?.color ||
      (log.action?.includes("create")
        ? "green"
        : log.action?.includes("delete")
        ? "red"
        : "yellow");

    const adminId = log.admin?.id;
    const adminAccount = adminId
      ? adminsMap.get(Number(adminId)) || adminsMap.get(String(adminId))
      : null;

    const resolvedEmail =
      (adminAccount?.email && adminAccount.email.trim() !== "" ? adminAccount.email : null) ||
      (log.user_email && log.user_email.trim() !== "" ? log.user_email : null) ||
      (log.admin?.name && log.admin.name.includes("@") ? log.admin.name : null);

    const adminName = resolvedEmail
      ? resolvedEmail
      : log.admin?.name && !log.admin.name.startsWith("مشرف #")
      ? log.admin.name
      : (adminId ? `مشرف #${adminId}` : "النظام");

    return {
      id: log.id || `log-${index}`,
      action: log.action || "action",
      action_type: actionTypeObj || actionLabel,
      action_label: actionLabel,
      action_color: actionColor,
      title: log.title || log.description || "عملية في النظام",
      description: log.description || log.title || "عملية في النظام",
      tags: Array.isArray(log.tags) ? log.tags : [],
      type:
        Array.isArray(log.tags) && log.tags.length > 0
          ? log.tags[0]
          : log.target_type || "عام",
      admin_name: adminName,
      admin_email: resolvedEmail || undefined,
      admin_id: adminId,
      is_super_admin: adminAccount?.is_super_admin,
      created_at: log.created_at || new Date().toISOString(),
    };
  });
}
