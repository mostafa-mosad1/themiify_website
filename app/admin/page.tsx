// app/admin/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { IoIosColorPalette } from "react-icons/io";
import { HiDocumentText } from "react-icons/hi2";
import ActivitiesList from "@/components/ui/ActivitiesList";
import { Activity } from "@/types/theme.types";
import { fetchThemes } from "@/lib/api/themes";
import { fetchBlogs } from "@/lib/api/blogs";
import { fetchAdminLogs } from "@/lib/api/logs";
import { fetchAdminById, fetchAdmins, IAdminAccount } from "@/lib/api/admins";
import { getCurrentServerUser } from "@/lib/utils/serverAuth";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("authToken")?.value ||
    cookieStore.get("adminToken")?.value ||
    cookieStore.get("bearer_token")?.value ||
    null;

  const currentUser = await getCurrentServerUser();
  const isSuperAdmin = Boolean(currentUser?.isSuperAdmin);

  const [themesRes, blogsRes, logsRes, adminsRes] =
    await Promise.all([
      fetchThemes({ per_page: 1 }),
      fetchBlogs({ per_page: 1 }),
      fetchAdminLogs(token, 1),
      isSuperAdmin ? fetchAdmins(token) : Promise.resolve({ admins: [] }),
    ]);

  const themesCount = themesRes.pagination?.total ?? (themesRes.themes?.length || 0);
  const articlesCount = blogsRes.pagination?.total ?? (blogsRes.blogs?.length || 0);
  const logs = logsRes.logs || [];

  // وضع المشرفين المسترجعين من GET /admin/admins في الـ Map
  const adminsMap = new Map<number | string, IAdminAccount>();
  (adminsRes.admins || []).forEach((adm) => {
    if (adm.id !== undefined && adm.id !== null) {
      adminsMap.set(Number(adm.id), adm);
      adminsMap.set(String(adm.id), adm);
    }
  });

  // جلب بيانات أي مشرف إضافي غير موجود بالقائمة عبر GET /admin/admins/{id} (للسوبر أدمن فقط)
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

  const formattedActivities: Activity[] = (logs || []).map((log: any, index: number) => {
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

  return (
    <div className="space-y-8 p-1 md:p-3" dir="rtl">
      {/* ─── قسم الترحيب والإحصائيات العلوية ─── */}
      <div className="flex flex-col gap-3">
        <div className="text-[--primary-color] dark:text-amber-400 font-semibold text-base flex items-center gap-1.5 select-none">
          <span>✨</span>
          <span>مرحباً بك في لوحة التحكم الخاصة بك</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          {/* كارت عدد الثيمات */}
          <Link
            href="/admin/themes"
            className="bg-white dark:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 rounded-3xl p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-primary/40 transition-all flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 flex items-center justify-center text-[#f26a21] group-hover:scale-110 transition-transform shrink-0">
              <IoIosColorPalette size={26} />
            </div>
            <div className="space-y-0.5">
              <p className="text-3xl md:text-4xl font-extrabold text-[#0e132c] dark:text-white font-mono leading-none">
                {themesCount}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium pt-1">
                عدد الثيمات
              </p>
            </div>
          </Link>

          {/* كارت عدد المقالات */}
          <Link
            href="/admin/essays"
            className="bg-white dark:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 rounded-3xl p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-primary/40 transition-all flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 flex items-center justify-center text-[#f26a21] group-hover:scale-110 transition-transform shrink-0">
              <HiDocumentText size={26} />
            </div>
            <div className="space-y-0.5">
              <p className="text-3xl md:text-4xl font-extrabold text-[#0e132c] dark:text-white font-mono leading-none">
                {articlesCount}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium pt-1">
                عدد المقالات
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ─── قسم يمكنك التحكم في التالي ─── */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-[#0e132c] dark:text-white">
          يمكنك التحكم في التالي:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {/* إضافة ثيم جديد */}
          <Link
            href="/admin/themes"
            className="bg-white dark:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 rounded-3xl p-7 md:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-4 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <svg className="w-12 h-12 text-[#0e132c] dark:text-white group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 2H9C7.89543 2 7 2.89543 7 4V16C7 17.1046 7.89543 18 9 18H19C20.1046 18 21 17.1046 21 16V4C21 2.89543 20.1046 2 19 2ZM17 9H11V7H17V9ZM15 13H11V11H15V13Z" />
                <circle cx="17" cy="17" r="6" fill="#0e132c" className="dark:fill-slate-800" stroke="white" strokeWidth="1.5" />
                <path d="M17 14V20M14 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm md:text-base font-bold text-[#0e132c] dark:text-white group-hover:text-primary transition-colors">
              + إضافة ثيم جديد
            </span>
          </Link>

          {/* إضافة مقالة */}
          <Link
            href="/admin/essays"
            className="bg-white dark:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 rounded-3xl p-7 md:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-4 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <svg className="w-12 h-12 text-[#0e132c] dark:text-white group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H14C15.1046 22 16 21.1046 16 20V8L14 2ZM13 9V3.5L18.5 9H13Z" />
                <circle cx="17" cy="17" r="6" fill="#0e132c" className="dark:fill-slate-800" stroke="white" strokeWidth="1.5" />
                <path d="M17 14V20M14 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm md:text-base font-bold text-[#0e132c] dark:text-white group-hover:text-primary transition-colors">
              + إضافة مقالة
            </span>
          </Link>

          {/* إضافة بيانات الدعم */}
          <Link
            href="/admin/support"
            className="bg-white dark:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 rounded-3xl p-7 md:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-4 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <svg className="w-12 h-12 text-[#0e132c] dark:text-white group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                <circle cx="18" cy="18" r="5" fill="#0e132c" className="dark:fill-slate-800" stroke="white" strokeWidth="1.5" />
                <path d="M18 15.5V20.5M15.5 18H20.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm md:text-base font-bold text-[#0e132c] dark:text-white group-hover:text-primary transition-colors">
              + إضافة بيانات الدعم
            </span>
          </Link>
        </div>
      </div>

      {/* ─── قسم سجل الأنشطة ─── */}
      <ActivitiesList initialActivities={formattedActivities} />
    </div>
  );
}