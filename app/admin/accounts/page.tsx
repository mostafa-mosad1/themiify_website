// app/admin/accounts/page.tsx
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import TablePage from "@/components/ui/TablePage";
import UnauthorizedMessage from "@/components/ui/UnauthorizedMessage";
import { MdAdminPanelSettings, MdSecurity } from "react-icons/md";
import { FaClock, FaUsersCog, FaUserShield } from "react-icons/fa";
import {
  fetchAdmins,
  fetchAdminById as apiFetchAdminById,
  createAdmin as apiCreateAdmin,
  updateAdmin as apiUpdateAdmin,
  deleteAdmin as apiDeleteAdmin,
  IAdminAccount,
} from "@/lib/api/admins";
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
    });
  } catch {
    return "-";
  }
}

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

  const formattedAccounts = (admins || []).map((account: IAdminAccount) => ({
    id: account.id,
    email: account.email,
    is_super_admin: account.is_super_admin,
    role_display: account.is_super_admin ? "سوبر أدمن" : "أدمن",
    created_at: formatDate(account.created_at),
    updated_at: formatDate(account.updated_at),
  }));

  const accountsForEdit = (admins || []).map((account: IAdminAccount) => ({
    id: account.id,
    original_id: account.id,
    email: account.email,
  }));

  const totalAdmins = pagination?.total ?? (admins?.length || 0);
  const superAdminsCount = (admins || []).filter((a) => a.is_super_admin).length;
  const regularAdminsCount = (admins || []).filter((a) => !a.is_super_admin).length;

  const stats = [
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
          ? formatDate(admins[0].created_at)
          : "لا يوجد",
      icon: <FaClock className="text-green-500 text-2xl" />,
      color: "green",
    },
  ];

  const columns = [
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

  const addFields = [
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

  const editFields = [
    {
      name: "email",
      label: "البريد الإلكتروني",
      type: "email" as const,
      required: true,
      placeholder: "admin@themiify.com",
    },
  ];

  return (
    <TablePage
      title="accounts"
      description="إدارة حسابات الأدمن وإضافة وتعديل بياناتهم"
      data={formattedAccounts}
      editData={accountsForEdit}
      columns={columns}
      stats={stats}
      pagination={pagination}
      itemsPerPage={15}
      onAdd={handleCreateAccount}
      onEdit={handleUpdateAccount}
      onDelete={handleDeleteAccount}
      onFetchItem={getAccountDetails}
      addModalFields={addFields}
      editModalFields={editFields}
      idKey="id"
    />
  );
}