// app/admin/accounts/page.tsx
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import TablePage from "@/components/ui/TablePage";
import UnauthorizedMessage from "@/components/ui/UnauthorizedMessage";
import {
  fetchAdmins,
  fetchAdminById as apiFetchAdminById,
  createAdmin as apiCreateAdmin,
  updateAdmin as apiUpdateAdmin,
  deleteAdmin as apiDeleteAdmin,
  adminAccountsTableColumns,
  adminAccountAddFields,
  adminAccountEditFields,
  formatAdminAccounts,
  formatAdminAccountsForEdit,
  getAdminAccountsStats,
} from "@/features/admins";
import { getCurrentServerUser } from "@/lib/utils/serverAuth";

async function getAuthTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get("authToken")?.value ||
    cookieStore.get("adminToken")?.value ||
    cookieStore.get("bearer_token")?.value ||
    null
  );
}

interface AccountsPageProps {
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  // التحقق من صلاحية السوبر أدمن
  const currentUser = await getCurrentServerUser();
  if (!currentUser?.isSuperAdmin) {
    return (
      <UnauthorizedMessage
        title="غير مصرح بالدخول"
        message="هذه الصفحة مخصصة للسوبر أدمن فقط لإدارة الحسابات."
        isAdmin={Boolean(currentUser?.isAdmin)}
        isLoggedIn={Boolean(currentUser)}
      />
    );
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pageParam = resolvedSearchParams?.page;
  const page = typeof pageParam === "string" ? parseInt(pageParam, 10) || 1 : 1;

  const token = await getAuthTokenFromCookies();
  const { admins, pagination } = await fetchAdmins(token, page);

  // Server Actions
  async function handleCreateAccount(formData: FormData) {
    "use server";
    const serverToken = await getAuthTokenFromCookies();
    const result = await apiCreateAdmin(formData, serverToken);
    if (result.success) {
      revalidatePath("/admin/accounts");
    }
    return result;
  }

  async function handleUpdateAccount(formData: FormData) {
    "use server";
    const id = formData.get("original_id") as string;
    const serverToken = await getAuthTokenFromCookies();
    const result = await apiUpdateAdmin(id, formData, serverToken);
    if (result.success) {
      revalidatePath("/admin/accounts");
    }
    return result;
  }

  async function handleDeleteAccount(id: string) {
    "use server";
    const serverToken = await getAuthTokenFromCookies();
    const result = await apiDeleteAdmin(id, serverToken);
    if (result.success) {
      revalidatePath("/admin/accounts");
    }
    return result;
  }

  async function getAccountDetails(id: string | number) {
    "use server";
    const serverToken = await getAuthTokenFromCookies();
    const admin = await apiFetchAdminById(id, serverToken);
    if (!admin) return null;
    return {
      id: admin.id,
      email: admin.email,
      is_super_admin: admin.is_super_admin,
      role: admin.is_super_admin ? "سوبر أدمن" : "أدمن",
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    };
  }

  const formattedAccounts = formatAdminAccounts(admins);
  const accountsForEdit = formatAdminAccountsForEdit(admins);
  const stats = getAdminAccountsStats(admins, pagination?.total);

  return (
    <TablePage
      title="accounts"
      description="إدارة حسابات الأدمن وإضافة وتعديل بياناتهم"
      data={formattedAccounts}
      editData={accountsForEdit}
      columns={adminAccountsTableColumns}
      stats={stats}
      pagination={pagination}
      itemsPerPage={15}
      onAdd={handleCreateAccount}
      onEdit={handleUpdateAccount}
      onDelete={handleDeleteAccount}
      onFetchItem={getAccountDetails}
      addModalFields={adminAccountAddFields}
      editModalFields={adminAccountEditFields}
      idKey="id"
    />
  );
}