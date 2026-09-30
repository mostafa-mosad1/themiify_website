// app/admin/accounts/page.tsx
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import AccountsClient from "./AccountsClient";
import UnauthorizedMessage from "@/components/ui/UnauthorizedMessage";
import {
  fetchAdmins,
  fetchAdminById as apiFetchAdminById,
  fetchEndUsers,
  createAdmin as apiCreateAdmin,
  updateAdmin as apiUpdateAdmin,
  deleteAdmin as apiDeleteAdmin,
  deleteEndUser as apiDeleteEndUser,
  adminAccountsTableColumns,
  endUsersTableColumns,
  adminAccountAddFields,
  adminAccountEditFields,
  formatAdminAccounts,
  formatEndUsers,
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
  const { admins, pagination: adminsPagination } = await fetchAdmins(token, page);
  const { users, pagination: usersPagination } = await fetchEndUsers(token, page);

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

  async function handleDeleteUser(id: string) {
    "use server";
    const serverToken = await getAuthTokenFromCookies();
    const result = await apiDeleteEndUser(id, serverToken);
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
  const formattedUsers = formatEndUsers(users);
  const accountsForEdit = formatAdminAccountsForEdit(admins);
  const adminsStats = getAdminAccountsStats(admins, adminsPagination?.total, usersPagination?.total);
  const usersStats = [
    {
      label: "إجمالي المستخدمين",
      value: usersPagination?.total || users.length,
      icon: <div className="text-orange-500 text-2xl">👥</div>,
      color: "orange",
    },
  ];

  return (
    <AccountsClient
      adminsData={formattedAccounts}
      usersData={formattedUsers}
      adminsPagination={adminsPagination}
      usersPagination={usersPagination}
      adminsColumns={adminAccountsTableColumns}
      usersColumns={endUsersTableColumns}
      adminsStats={adminsStats}
      usersStats={usersStats}
      onAdd={handleCreateAccount}
      onEdit={handleUpdateAccount}
      onDelete={handleDeleteAccount}
      onDeleteUser={handleDeleteUser}
      onFetchItem={getAccountDetails}
      addModalFields={adminAccountAddFields}
      editModalFields={adminAccountEditFields}
      idKey="id"
    />
  );
}