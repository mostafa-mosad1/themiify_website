// app/admin/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { IoIosColorPalette } from "react-icons/io";
import { HiDocumentText } from "react-icons/hi2";
import {
  FaGlobe,
  FaHeadset,
  FaHistory,
  FaQuestionCircle,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import { MdCategory, MdOutlineSupportAgent } from "react-icons/md";
import ActivitiesList from "@/components/ui/ActivitiesList";
import { fetchThemes } from "@/lib/api/themes";
import { fetchBlogs } from "@/lib/api/blogs";
import { fetchAdminLogs } from "@/lib/api/logs";
import { fetchCategories } from "@/lib/api/categories";
import { fetchPlatforms } from "@/lib/api/platforms";
import { fetchAdminSupportCategories } from "@/lib/api/support-categories";
import { fetchAdminSupportQuestions } from "@/lib/api/support-questions";
import { fetchAdminSupportChannels } from "@/lib/api/support-channels";
import { fetchAdminFeedbacks } from "@/lib/api/feedbacks";
import {
  fetchAdminById,
  fetchAdmins,
  IAdminAccount,
  formatDashboardActivities,
  dashboardQuickActions,
} from "@/features/admins";
import { getCurrentServerUser } from "@/lib/utils/serverAuth";

function renderQuickActionIcon(type: "theme" | "essay" | "support") {
  switch (type) {
    case "theme":
      return (
        <svg className="w-12 h-12 text-[#0e132c] dark:text-white group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 2H9C7.89543 2 7 2.89543 7 4V16C7 17.1046 7.89543 18 9 18H19C20.1046 18 21 17.1046 21 16V4C21 2.89543 20.1046 2 19 2ZM17 9H11V7H17V9ZM15 13H11V11H15V13Z" />
          <circle cx="17" cy="17" r="6" fill="#0e132c" className="dark:fill-slate-800" stroke="white" strokeWidth="1.5" />
          <path d="M17 14V20M14 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "essay":
      return (
        <svg className="w-12 h-12 text-[#0e132c] dark:text-white group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H14C15.1046 22 16 21.1046 16 20V8L14 2ZM13 9V3.5L18.5 9H13Z" />
          <circle cx="17" cy="17" r="6" fill="#0e132c" className="dark:fill-slate-800" stroke="white" strokeWidth="1.5" />
          <path d="M17 14V20M14 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "support":
      return (
        <svg className="w-12 h-12 text-[#0e132c] dark:text-white group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          <circle cx="18" cy="18" r="5" fill="#0e132c" className="dark:fill-slate-800" stroke="white" strokeWidth="1.5" />
          <path d="M18 15.5V20.5M15.5 18H20.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("authToken")?.value ||
    cookieStore.get("adminToken")?.value ||
    cookieStore.get("bearer_token")?.value ||
    null;

  const currentUser = await getCurrentServerUser();
  const isSuperAdmin = Boolean(currentUser?.isSuperAdmin);

  const [
    themesRes,
    blogsRes,
    logsRes,
    adminsRes,
    categoriesRes,
    platformsRes,
    supportCategories,
    supportQuestionsRes,
    supportChannelsRes,
    feedbacksRes,
  ] = await Promise.all([
      fetchThemes({ per_page: 1 }),
      fetchBlogs({ per_page: 1 }),
      fetchAdminLogs(token, 1),
      isSuperAdmin
        ? fetchAdmins(token)
        : Promise.resolve({ admins: [], pagination: undefined }),
      fetchCategories(token, 1),
      fetchPlatforms(token, 1),
      fetchAdminSupportCategories(token),
      fetchAdminSupportQuestions(token),
      fetchAdminSupportChannels(token),
      fetchAdminFeedbacks(token),
    ]);

  const themesCount = themesRes.pagination?.total ?? (themesRes.themes?.length || 0);
  const articlesCount = blogsRes.pagination?.total ?? (blogsRes.blogs?.length || 0);
  const categoriesCount = categoriesRes.pagination?.total ?? categoriesRes.categories.length;
  const platformsCount = platformsRes.pagination?.total ?? platformsRes.platforms.length;
  const supportCategoriesCount = supportCategories.length;
  const supportQuestionsCount = supportQuestionsRes.questions.length;
  const supportChannelsCount = supportChannelsRes.channels.length;
  const feedbacksCount = feedbacksRes.feedbacks.length;
  const logs = logsRes.logs || [];
  const accountsCount = adminsRes.pagination?.total ?? adminsRes.admins.length;
  const logsCount = logsRes.pagination?.total ?? logs.length;

  const statCards = [
    { label: "عدد الثيمات", value: themesCount, href: "/admin/themes", icon: <IoIosColorPalette size={25} /> },
    { label: "عدد المقالات", value: articlesCount, href: "/admin/essays", icon: <HiDocumentText size={25} /> },
    { label: "أقسام الثيمات", value: categoriesCount, href: "/admin/categories", icon: <MdCategory size={25} /> },
    { label: "المنصات", value: platformsCount, href: "/admin/platforms", icon: <FaGlobe size={23} /> },
    { label: "فئات الدعم", value: supportCategoriesCount, href: "/admin/support", icon: <MdOutlineSupportAgent size={25} /> },
    { label: "أسئلة الدعم", value: supportQuestionsCount, href: "/admin/support", icon: <FaQuestionCircle size={23} /> },
    { label: "قنوات الدعم", value: supportChannelsCount, href: "/admin/support", icon: <FaHeadset size={23} /> },
    { label: "تقييمات المستخدمين", value: feedbacksCount, href: "/admin/form", icon: <FaStar size={23} /> },
    { label: "سجل الأنشطة", value: logsCount, href: "/admin/logs", icon: <FaHistory size={23} /> },
    ...(isSuperAdmin
      ? [
          { label: "حسابات الأدمن", value: accountsCount, href: "/admin/accounts", icon: <FaUsers size={23} /> },
        ]
      : []),
  ];

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

  const formattedActivities = formatDashboardActivities(logs, adminsMap);

  return (
    <div className="space-y-8 p-1 md:p-3" dir="rtl">
      {/* ─── قسم الترحيب والإحصائيات العلوية ─── */}
      <div className="flex flex-col gap-3">
        <div className="text-[--primary-color] dark:text-amber-400 font-semibold text-base flex items-center gap-1.5 select-none">
          <span>✨</span>
          <span>مرحباً بك في لوحة التحكم الخاصة بك</span>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group flex cursor-pointer items-center gap-4 rounded-3xl border border-[var(--border-color)]/70 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:border-primary/40 hover:shadow-md dark:bg-[var(--bg-secondary)] md:p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-[#f26a21] transition-transform group-hover:scale-110 dark:border-orange-900/40 dark:bg-orange-950/40">
                {stat.icon}
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="font-mono text-3xl font-extrabold leading-none text-[#0e132c] dark:text-white md:text-4xl">
                  {stat.value}
                </p>
                <p className="pt-1 text-xs font-medium text-gray-500 dark:text-gray-400 md:text-sm">
                  {stat.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── قسم يمكنك التحكم في التالي ─── */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-[#0e132c] dark:text-white">
          يمكنك التحكم في التالي:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {dashboardQuickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white dark:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 rounded-3xl p-7 md:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-4 group cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                {renderQuickActionIcon(action.type)}
              </div>
              <span className="text-sm md:text-base font-bold text-[#0e132c] dark:text-white group-hover:text-primary transition-colors">
                {action.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── قسم سجل الأنشطة ─── */}
      <ActivitiesList initialActivities={formattedActivities} />
    </div>
  );
}