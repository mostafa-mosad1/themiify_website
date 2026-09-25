// app/admin/logs/page.tsx
import { cookies } from "next/headers";
import TablePage from "@/components/ui/TablePage";
import { MdHistory } from "react-icons/md";
import { FaClock, FaUser, FaTags } from "react-icons/fa";
import { fetchAdminLogs, ILog } from "@/lib/api/logs";
import { fetchAdminById, fetchAdmins, IAdminAccount } from "@/lib/api/admins";
import { getCurrentServerUser } from "@/lib/utils/serverAuth";

function formatDate(dateString?: string) {
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

interface LogsPageProps {
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pageParam = resolvedSearchParams?.page;
  const page = typeof pageParam === "string" ? parseInt(pageParam, 10) || 1 : 1;

  const cookieStore = await cookies();
  const token =
    cookieStore.get("authToken")?.value ||
    cookieStore.get("adminToken")?.value ||
    cookieStore.get("bearer_token")?.value ||
    null;

  const currentUser = await getCurrentServerUser();
  const isSuperAdmin = Boolean(currentUser?.isSuperAdmin);

  const [{ logs, pagination }, adminsRes] = await Promise.all([
    fetchAdminLogs(token, page),
    isSuperAdmin ? fetchAdmins(token) : Promise.resolve({ admins: [] }),
  ]);

  // وضع المشرفين المسترجعين من GET /admin/admins في الـ Map
  const adminsMap = new Map<number | string, IAdminAccount>();
  (adminsRes.admins || []).forEach((adm) => {
    if (adm.id !== undefined && adm.id !== null) {
      adminsMap.set(Number(adm.id), adm);
      adminsMap.set(String(adm.id), adm);
    }
  });

  // جلب بيانات المشرفين الإضافيين بالـ ID إن لم يكونوا موجودين بالقائمة (للسوبر أدمن فقط)
  const missingAdminIds = isSuperAdmin
    ? Array.from(
        new Set(
          logs
            .map((l: any) => l.admin?.id)
            .filter((id: any) => (typeof id === "number" || (typeof id === "string" && id !== "")) && !adminsMap.has(id))
        )
      )
    : [];

  if (missingAdminIds.length > 0) {
    await Promise.all(
      missingAdminIds.map(async (adminId) => {
        try {
          const adminData = await fetchAdminById(adminId, token);
          if (adminData) {
            adminsMap.set(Number(adminId), adminData);
            adminsMap.set(String(adminId), adminData);
          }
        } catch (e) {
          console.warn(`Could not fetch admin details for ID ${adminId}:`, e);
        }
      })
    );
  }

  const formattedLogs = (logs || []).map((log: ILog, index: number) => {
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

    const tagsStr = Array.isArray(log.tags) && log.tags.length > 0
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
      created_at: formatDate(log.created_at),
    };
  });

  const totalLogs = pagination?.total ?? (logs?.length || 0);
  const lastActivity =
    logs && logs.length > 0 ? formatDate(logs[0].created_at) : "لا يوجد";

  const activeAdmins =
    new Set(
      logs?.map((l) => l.admin?.id || l.user_email || l.user_id).filter(Boolean)
    ).size || 1;

  const allTags = new Set(
    logs?.flatMap((l) => l.tags || (l.target_type ? [l.target_type] : [])).filter(Boolean)
  ).size || 1;

  const stats = [
    {
      label: "إجمالي السجلات",
      value: totalLogs,
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

  const columns = [
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

  return (
    <TablePage
      title="logs"
      description="سجل جميع العمليات والأنشطة في النظام مع تفاصيل الإجراءات والوسوم"
      data={formattedLogs}
      columns={columns}
      stats={stats}
      pagination={pagination}
      itemsPerPage={15}
      idKey="id"
    />
  );
}
