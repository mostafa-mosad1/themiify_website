"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  FaUser,
  FaClock,
  FaHistory,
  FaArrowLeft,
  FaTag,
  FaChevronDown,
} from "react-icons/fa";
import { Activity } from "@/types/theme.types";
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { PiUploadBold } from "react-icons/pi";
import { fetchAdminById, fetchAdmins, normalizeAdmin, IAdminAccount } from "@/lib/api/admins";
import { fetchAdminLogs } from "@/lib/api/logs";

interface ActivitiesListProps {
  initialActivities: Activity[];
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "منذ لحظات";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `منذ ${diffInDays} يوم`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `منذ ${diffInMonths} شهر`;
  } catch {
    return dateString || "-";
  }
}

function getActionInfo(activity: Activity) {
  let label = "تعديل";
  let color = "yellow";
  let typeKey = "update";

  if (typeof activity.action_type === "object" && activity.action_type !== null) {
    label = activity.action_type.label || "إجراء";
    color = activity.action_type.color || "yellow";
    if (color === "green" || label.includes("إضافة") || label.includes("رفع")) {
      typeKey = "add";
    } else if (color === "red" || label.includes("حذف")) {
      typeKey = "delete";
    } else {
      typeKey = "update";
    }
  } else if (typeof activity.action_type === "string") {
    if (activity.action_type === "add" || activity.action_type.includes("create")) {
      label = "إضافة";
      color = "green";
      typeKey = "add";
    } else if (activity.action_type === "delete") {
      label = "حذف";
      color = "red";
      typeKey = "delete";
    } else {
      label = "تعديل";
      color = "yellow";
      typeKey = "update";
    }
  } else if (activity.action) {
    if (activity.action.includes("create") || activity.action.includes("add")) {
      label = "إضافة";
      color = "green";
      typeKey = "add";
    } else if (activity.action.includes("delete")) {
      label = "حذف";
      color = "red";
      typeKey = "delete";
    } else {
      label = "تعديل";
      color = "yellow";
      typeKey = "update";
    }
  }

  if (activity.action_label) label = activity.action_label;
  if (activity.action_color) color = activity.action_color;

  return { label, color, typeKey };
}

function renderStatusBadge(activity: Activity) {
  const { label, color, typeKey } = getActionInfo(activity);
  
  if (color === "green" || typeKey === "add" || label.includes("إضافة") || label.includes("رفع")) {
    return (
      <span className="bg-[#10b981] text-white px-4 py-0.5 rounded-full text-xs font-semibold shadow-sm inline-block">
        إضافة
      </span>
    );
  }
  
  if (color === "red" || typeKey === "delete" || label.includes("حذف")) {
    return (
      <span className="bg-[#ef4444] text-white px-4 py-0.5 rounded-full text-xs font-semibold shadow-sm inline-block">
        حذف
      </span>
    );
  }

  return (
    <span className="bg-[#1e293b] text-white px-4 py-0.5 rounded-full text-xs font-semibold shadow-sm inline-block">
      تعديل
    </span>
  );
}

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: "default-1",
    action: "create_theme",
    action_type: { label: "إضافة", color: "green" },
    action_label: "إضافة",
    action_color: "green",
    title: "تم رفع ثيم",
    description: "تم إضافة إعدادات قالب الوضع المظلم إلى النظام",
    tags: ["القوالب"],
    type: "القوالب",
    admin_name: "ادمن",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "default-2",
    action: "delete_content",
    action_type: { label: "حذف", color: "red" },
    action_label: "حذف",
    action_color: "red",
    title: "تم حذف المحتوى",
    description: "إزالة النسخ التسويقية القديمة من المكتبة",
    tags: ["القوالب"],
    type: "القوالب",
    admin_name: "ادمن",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "default-3",
    action: "update_guidelines",
    action_type: { label: "تعديل", color: "yellow" },
    action_label: "تعديل",
    action_color: "yellow",
    title: "تم تحديث الإرشادات",
    description: "تحديث إرشادات استخدام الشعار مع قواعد جديدة للحجم",
    tags: ["القوالب"],
    type: "القوالب",
    admin_name: "ادمن",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "default-4",
    action: "update_guidelines_2",
    action_type: { label: "تعديل", color: "yellow" },
    action_label: "تعديل",
    action_color: "yellow",
    title: "تم تحديث الإرشادات",
    description: "تحديث إرشادات استخدام الشعار مع قواعد جديدة للحجم",
    tags: ["القوالب"],
    type: "القوالب",
    admin_name: "ادمن",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export default function ActivitiesList({
  initialActivities,
}: ActivitiesListProps) {
  const [filters, setFilters] = useState({
    actionType: "all",
    table: "all",
    dateRange: "all",
  });

  const [activities, setActivities] = useState<Activity[]>(
    initialActivities && initialActivities.length > 0
      ? initialActivities
      : DEFAULT_ACTIVITIES
  );
  const [loading, setLoading] = useState(false);
  const [adminCache, setAdminCache] = useState<Record<string | number, IAdminAccount>>({});
  const fetchedIdsRef = useRef<Set<string | number>>(new Set());

  // جلب السجلات من الـ API على مستوى العميل فقط إذا لم تكن متوفرة من الـ Server
  useEffect(() => {
    let isMounted = true;

    // إذا كانت الأنشطة متوفرة مسبقاً من الـ Server Component، نعتمد عليها دون تكرار الطلب
    if (initialActivities && initialActivities.length > 0) {
      setActivities(initialActivities);
      return;
    }

    const loadLogs = async () => {
      try {
        setLoading(true);
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken") ||
              localStorage.getItem("bearer_token") ||
              localStorage.getItem("adminToken")
            : null;

        const isSuperAdmin =
          typeof window !== "undefined"
            ? localStorage.getItem("userRole") === "super_admin" ||
              localStorage.getItem("is_super_admin") === "true"
            : false;

        const [logsRes, adminsRes] = await Promise.all([
          fetchAdminLogs(token, 1),
          isSuperAdmin ? fetchAdmins(token) : Promise.resolve({ admins: [] }),
        ]);

        const adminsMap = new Map<number | string, IAdminAccount>();
        (adminsRes.admins || []).forEach((adm: IAdminAccount) => {
          if (adm.id !== undefined && adm.id !== null) {
            adminsMap.set(Number(adm.id), adm);
            adminsMap.set(String(adm.id), adm);
          }
        });

        const rawLogs = logsRes.logs || [];
        if (rawLogs.length === 0) {
          if (initialActivities && initialActivities.length > 0) {
            if (isMounted) setActivities(initialActivities);
          } else {
            if (isMounted) setActivities(DEFAULT_ACTIVITIES);
          }
          return;
        }

        const missingAdminIds: (string | number)[] = isSuperAdmin
          ? Array.from(
              new Set(
                rawLogs
                  .map((l: any) => l.admin?.id)
                  .filter(
                    (id: any): id is string | number =>
                      (typeof id === "number" || (typeof id === "string" && id !== "")) &&
                      !adminsMap.has(id)
                  )
              )
            )
          : [];

        if (missingAdminIds.length > 0) {
          await Promise.all(
            missingAdminIds.map(async (adminId: string | number) => {
              try {
                const adminData = await fetchAdminById(adminId, token);
                if (adminData) {
                  adminsMap.set(Number(adminId), adminData);
                  adminsMap.set(String(adminId), adminData);
                }
              } catch {}
            })
          );
        }

        const formatted: Activity[] = rawLogs.map((log: any, index: number) => {
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
            : adminId
            ? `مشرف #${adminId}`
            : "النظام";

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

        if (isMounted) {
          setActivities(formatted.length > 0 ? formatted : DEFAULT_ACTIVITIES);
        }
      } catch (err) {
        console.error("Failed to load activities on client:", err);
        if (isMounted && (!activities || activities.length === 0)) {
          setActivities(DEFAULT_ACTIVITIES);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, [initialActivities]);

  // جلب بيانات المشرفين من admin/admins و admin/admins/{id}
  useEffect(() => {
    const idsToFetch = (activities || [])
      .map((a) => a.admin_id)
      .filter(
        (id): id is number | string =>
          id !== undefined && id !== null && id !== "" && !fetchedIdsRef.current.has(id)
      );

    if (idsToFetch.length === 0) return;

    const uniqueIds = Array.from(new Set(idsToFetch));
    uniqueIds.forEach((id) => {
      fetchedIdsRef.current.add(id);
      fetchedIdsRef.current.add(String(id));
      fetchedIdsRef.current.add(Number(id));
    });

    (async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken") ||
              localStorage.getItem("bearer_token") ||
              localStorage.getItem("adminToken")
            : null;

        const map: Record<string | number, IAdminAccount> = {};

        // 0. الاستفادة من بيانات المستخدم المسجل محلياً إن وجدت
        const storedUserData =
          typeof window !== "undefined"
            ? localStorage.getItem("userData")
            : null;
        if (storedUserData) {
          try {
            const parsedUser = JSON.parse(storedUserData);
            if (parsedUser && (parsedUser.id || parsedUser.email)) {
              const uObj = normalizeAdmin(parsedUser);
              if (uObj && uObj.id) {
                map[uObj.id] = uObj;
                map[String(uObj.id)] = uObj;
                map[Number(uObj.id)] = uObj;
              }
            }
          } catch {}
        }

        // 1. جلب قائمة المشرفين العامة
        const allAdminsRes = await fetchAdmins(token);

        (allAdminsRes.admins || []).forEach((adm) => {
          if (adm.id) {
            map[adm.id] = adm;
            map[String(adm.id)] = adm;
            map[Number(adm.id)] = adm;
          }
        });

        // 2. جلب أي مشرف بالـ ID بشكل مباشر إذا لم يكن موجوداً
        await Promise.all(
          uniqueIds.map(async (id) => {
            if (!map[id]) {
              try {
                const adm = await fetchAdminById(id, token);
                if (adm) {
                  map[adm.id] = adm;
                  map[String(adm.id)] = adm;
                  map[Number(adm.id)] = adm;
                  map[id] = adm;
                  map[String(id)] = adm;
                }
              } catch (e) {
                console.warn(`Could not fetch admin ID ${id}:`, e);
              }
            }
          })
        );

        setAdminCache((prev) => ({ ...prev, ...map }));
      } catch (err) {
        console.error("Error loading admin details:", err);
      }
    })();
  }, [activities]);

  const sortedActivities = [...activities].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime() || 0;
    const bTime = new Date(b.created_at).getTime() || 0;
    return bTime - aTime;
  });

  // استخراج الفئات والوسوم المتاحة ديناميكياً
  const availableTags = Array.from(
    new Set(
      activities.flatMap((a) => {
        const list: string[] = [];
        if (Array.isArray(a.tags)) list.push(...a.tags);
        if (a.type && a.type !== "general" && a.type !== "عام") list.push(a.type);
        return list;
      })
    )
  ).filter(Boolean);

  const filterOptions = {
    actionTypes: [
      { value: "all", label: "نوع الإجراء" },
      { value: "add", label: "الإضافات" },
      { value: "update", label: "التعديلات" },
      { value: "delete", label: "الحذف" },
    ],
    tables: [
      { value: "all", label: "الفئة" },
      ...availableTags.map((tag) => ({ value: tag, label: tag })),
    ],
    dateRanges: [
      { value: "all", label: "التاريخ" },
      { value: "today", label: "اليوم" },
      { value: "yesterday", label: "أمس" },
      { value: "last7days", label: "آخر 7 أيام" },
      { value: "last30days", label: "آخر 30 يوم" },
      { value: "thisMonth", label: "هذا الشهر" },
    ],
  };

  // دالة تصفية الأنشطة
  const filteredActivities = sortedActivities.filter((activity) => {
    const { typeKey, label } = getActionInfo(activity);

    // فلتر نوع الإجراء
    if (filters.actionType !== "all") {
      if (filters.actionType !== typeKey && !label.includes(filters.actionType)) {
        return false;
      }
    }

    // فلتر الفئة أو المنصة (من الوسوم)
    if (filters.table !== "all") {
      const hasTag = activity.tags?.includes(filters.table);
      const matchesType = activity.type === filters.table;
      if (!hasTag && !matchesType) return false;
    }

    // فلتر التاريخ
    if (filters.dateRange !== "all") {
      const activityDate = new Date(activity.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filters.dateRange) {
        case "today":
          return activityDate >= today;
        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return activityDate >= yesterday && activityDate < today;
        }
        case "last7days": {
          const last7Days = new Date(today);
          last7Days.setDate(last7Days.getDate() - 7);
          return activityDate >= last7Days;
        }
        case "last30days": {
          const last30Days = new Date(today);
          last30Days.setDate(last30Days.getDate() - 30);
          return activityDate >= last30Days;
        }
        case "thisMonth": {
          const firstDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1,
          );
          return activityDate >= firstDayOfMonth;
        }
        default:
          return true;
      }
    }

    return true;
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      {/* ─── ترويسة سجل الأنشطة ─── */}
      <div className="space-y-0.5">
        <h3 className="text-lg md:text-xl font-bold text-[#0e132c] dark:text-white">
          سجل الأنشطة
        </h3>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          تتبع جميع التغييرات والتحديثات عبر لوحة التحكم الخاصة بك
        </p>
      </div>

      {/* ─── شريط الفلاتر ─── */}
      <div className="bg-white/80 dark:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 rounded-2xl p-2.5 md:p-3 flex flex-wrap items-center gap-2.5 shadow-sm">
        {/* فلتر نوع الإجراء */}
        <div className="relative min-w-[130px]">
          <select
            name="actionType"
            value={filters.actionType}
            onChange={handleFilterChange}
            className="w-full appearance-none bg-white dark:bg-[var(--bg-primary)] text-[#0e132c] dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl pr-3.5 pl-8 py-2 text-xs md:text-sm font-semibold focus:border-primary outline-none cursor-pointer shadow-sm hover:border-gray-400 transition-colors"
          >
            {filterOptions.actionTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] pointer-events-none" />
        </div>

        {/* فلتر الفئة */}
        <div className="relative min-w-[120px]">
          <select
            name="table"
            value={filters.table}
            onChange={handleFilterChange}
            className="w-full appearance-none bg-white dark:bg-[var(--bg-primary)] text-[#0e132c] dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl pr-3.5 pl-8 py-2 text-xs md:text-sm font-semibold focus:border-primary outline-none cursor-pointer shadow-sm hover:border-gray-400 transition-colors"
          >
            {filterOptions.tables.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] pointer-events-none" />
        </div>

        {/* فلتر التاريخ */}
        <div className="relative min-w-[120px]">
          <select
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            className="w-full appearance-none bg-white dark:bg-[var(--bg-primary)] text-[#0e132c] dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl pr-3.5 pl-8 py-2 text-xs md:text-sm font-semibold focus:border-primary outline-none cursor-pointer shadow-sm hover:border-gray-400 transition-colors"
          >
            {filterOptions.dateRanges.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] pointer-events-none" />
        </div>
      </div>

      {/* ─── بطاقة قائمة الأنشطة ─── */}
      <div className="bg-white dark:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 rounded-3xl p-4 md:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col">
        {filteredActivities.length > 0 ? (
          <div
            className="max-h-[380px] overflow-y-auto pr-2 pl-1 custom-activities-scrollbar"
            dir="ltr"
          >
            <div className="divide-y divide-gray-100 dark:divide-gray-800" dir="rtl">
              {filteredActivities.map((activity, index) => {
                const { color, typeKey, label } = getActionInfo(activity);
                const title = activity.title || activity.description || "عملية في النظام";
                const description = activity.description;
                const hasExtraDesc = description && description !== title;

                const adminId = activity.admin_id;
                const adminData = adminId
                  ? adminCache[adminId] || adminCache[String(adminId)] || adminCache[Number(adminId)]
                  : null;

                const resolvedEmail =
                  (adminData?.email && adminData.email.trim() !== "" ? adminData.email : null) ||
                  (activity.admin_email && activity.admin_email.trim() !== "" ? activity.admin_email : null) ||
                  (activity.admin_name && activity.admin_name.includes("@") ? activity.admin_name : null);

                const isSuperAdmin =
                  Boolean(activity.is_super_admin ?? adminData?.is_super_admin);

                const displayAdmin = resolvedEmail
                  ? resolvedEmail
                  : activity.admin_name && !activity.admin_name.startsWith("مشرف #")
                  ? activity.admin_name
                  : adminId
                  ? `مشرف #${adminId}`
                  : "ادمن";

                const tagName = activity.tags?.[0] || activity.type || "القوالب";

                return (
                  <div
                    key={activity.id || `activity-${index}`}
                    className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    {/* الجهة اليمنى: أيقونة الإجراء + النصوص */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* أيقونة الإجراء المربعة المستديرة */}
                      <div
                        className={`
                          w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                          ${
                            color === "green" || typeKey === "add" || label.includes("إضافة") || label.includes("رفع")
                              ? "bg-[#10b981] text-white"
                              : color === "red" || typeKey === "delete" || label.includes("حذف")
                              ? "bg-[#ef4444] text-white"
                              : "bg-[#1e293b] text-white"
                          }
                        `}
                      >
                        {color === "green" || typeKey === "add" || label.includes("إضافة") || label.includes("رفع") ? (
                          <PiUploadBold size={20} />
                        ) : color === "red" || typeKey === "delete" || label.includes("حذف") ? (
                          <RiDeleteBinLine size={20} />
                        ) : (
                          <FiEdit3 size={19} />
                        )}
                      </div>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="text-[#0e132c] dark:text-white font-bold text-sm leading-snug truncate">
                          {title}
                        </h4>

                        {hasExtraDesc && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed truncate">
                            {description}
                          </p>
                        )}

                        {/* سطر بيانات المشرف والوسم */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-[#1e293b] text-white flex items-center justify-center text-[9px] shrink-0">
                              <FaUser size={8} />
                            </span>
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                              {displayAdmin}
                            </span>
                          </span>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {tagName}
                          </span>
                          {isSuperAdmin && (
                            <span className="inline-block px-1.5 py-0.2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded-full border border-purple-200/50">
                              سوبر أدمن
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* الجهة اليسرى: شارة الحالة ووقت الإجراء */}
                    <div className="flex flex-col items-center sm:items-end justify-center gap-1.5 shrink-0">
                      {renderStatusBadge(activity)}
                      <span className="text-xs text-gray-400 font-medium">
                        {formatRelativeTime(activity.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
              <FaHistory className="text-gray-400 text-xl" />
            </div>
            <p className="text-gray-700 dark:text-gray-200 font-semibold text-sm">
              لا توجد أنشطة تطابق الفلاتر المحددة
            </p>
            {(filters.actionType !== "all" || filters.table !== "all" || filters.dateRange !== "all") && (
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    actionType: "all",
                    table: "all",
                    dateRange: "all",
                  })
                }
                className="mt-3 text-xs text-primary hover:underline font-semibold cursor-pointer"
              >
                إعادة تعيين الفلاتر
              </button>
            )}
          </div>
        )}
        
      </div>

      <style jsx global>{`
        .custom-activities-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-activities-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-activities-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 9999px;
        }
        html.dark .custom-activities-scrollbar::-webkit-scrollbar-thumb {
          background-color: #475569;
        }
        .custom-activities-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
