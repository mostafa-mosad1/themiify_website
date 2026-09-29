// app/admin/logs/page.tsx
import { cookies } from "next/headers";
import TablePage from "@/components/ui/TablePage";
import { fetchAdminLogs } from "@/lib/api/logs";
import { fetchAdminById, fetchAdmins, IAdminAccount } from "@/lib/api/admins";
import { getCurrentServerUser } from "@/lib/utils/serverAuth";
import {
  logTableColumns,
  formatLogs,
  getLogStats,
} from "@/features/logs";

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

  const formattedLogs = formatLogs(logs, adminsMap);
  const stats = getLogStats(logs, pagination?.total);

  return (
    <TablePage
      title="logs"
      description="سجل جميع العمليات والأنشطة في النظام مع تفاصيل الإجراءات والوسوم"
      data={formattedLogs}
      columns={logTableColumns}
      stats={stats}
      pagination={pagination}
      itemsPerPage={15}
      idKey="id"
    />
  );
}
