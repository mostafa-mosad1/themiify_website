import { apiClient } from "@/lib/api/config";
import type { IAdminAccount, IEndUser, IPaginationMeta } from "./types";
export type { IAdminAccount, IEndUser, IPaginationMeta };

export function normalizeAdmin(raw: any): IAdminAccount | null {
  if (!raw) return null;
  const item =
    raw.admin && typeof raw.admin === "object"
      ? raw.admin
      : raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)
        ? (raw.data.admin && typeof raw.data.admin === "object" ? raw.data.admin : raw.data)
        : raw.user && typeof raw.user === "object"
          ? raw.user
          : raw;

  if (!item || typeof item !== "object" || Array.isArray(item)) return null;

  const email =
    item.email ||
    item.user_email ||
    (item.name && item.name.includes("@") ? item.name : "") ||
    item.username ||
    item.name ||
    "";

  const adminId = Number(item.id || item.admin_id || item.user_id) || 0;

  return {
    id: adminId,
    email: email || "",
    is_super_admin: Boolean(
      item.is_super_admin ||
      item.isSuperAdmin ||
      item.is_super ||
      item.role === "super_admin" ||
      item.userRole === "super_admin"
    ),
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || item.created_at || new Date().toISOString(),
  };
}

/**
 * جلب جميع حسابات الأدمن
 */
export async function fetchAdmins(
  token?: string | null,
  page?: number
): Promise<{ admins: IAdminAccount[]; pagination?: IPaginationMeta }> {
  try {
    const url = page ? `/admin/admins?page=${page}` : `/admin/admins`;
    const res = await apiClient<any>(url, { silent: true }, token);

    if (res.success && res.data) {
      let rawList: any[] = [];
      let pagination: IPaginationMeta | undefined = undefined;

      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        rawList = res.data.data;
        pagination = {
          current_page: Number(res.data.current_page) || (page || 1),
          last_page: Number(res.data.last_page) || 1,
          per_page: Number(res.data.per_page) || 15,
          total: Number(res.data.total) || rawList.length,
          from: res.data.from,
          to: res.data.to,
        };
      } else if (Array.isArray(res.data.admins)) {
        rawList = res.data.admins;
      }

      const admins = rawList
        .map((item) => normalizeAdmin(item)!)
        .filter(Boolean);

      return { admins, pagination };
    }

    return { admins: [] };
  } catch (error) {
    return { admins: [] };
  }
}

/**
 * جلب تفاصيل حساب أدمن بواسطة ID
 */
export async function fetchAdminById(
  id: string | number,
  token?: string | null
): Promise<IAdminAccount | null> {
  try {
    const res = await apiClient<any>(`/admin/admins/${id}`, { silent: true }, token);
    if (res.success && res.data) {
      return normalizeAdmin(res.data);
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * إنشاء حساب أدمن جديد
 */
export async function createAdmin(
  data: { email: string; password: string } | FormData,
  token?: string | null
): Promise<{ success: boolean; data?: IAdminAccount; error?: string; message?: string }> {
  try {
    let payload: { email: string; password?: string } = { email: "" };
    if (data instanceof FormData) {
      payload = {
        email: (data.get("email") as string)?.trim(),
        password: data.get("password") as string,
      };
    } else {
      payload = {
        email: data.email?.trim(),
        password: data.password,
      };
    }

    const res = await apiClient<any>(
      "/admin/admins",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );

    if (res.success) {
      const normalized = normalizeAdmin(res.data);
      return {
        success: true,
        data: normalized || undefined,
        message: res.message || "تم إنشاء الحساب بنجاح",
      };
    }

    return {
      success: false,
      error: res.error || res.message || "فشل إنشاء الحساب",
    };
  } catch (error: any) {
    console.error("❌ Error creating admin account:", error);
    return {
      success: false,
      error: error?.message || "حدث خطأ غير متوقع أثناء إنشاء الحساب",
    };
  }
}

/**
 * تعديل بيانات حساب أدمن
 */
export async function updateAdmin(
  id: string | number,
  data: { email: string; password?: string } | FormData,
  token?: string | null
): Promise<{ success: boolean; data?: IAdminAccount; error?: string; message?: string }> {
  try {
    let payload: { email: string; password?: string } = { email: "" };
    if (data instanceof FormData) {
      payload = {
        email: (data.get("email") as string)?.trim(),
        password: (data.get("password") as string) || undefined,
      };
    } else {
      payload = {
        email: data.email?.trim(),
        password: data.password,
      };
    }

    const res = await apiClient<any>(
      `/admin/admins/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    );

    if (res.success) {
      const normalized = normalizeAdmin(res.data);
      return {
        success: true,
        data: normalized || undefined,
        message: res.message || "تم تعديل الحساب بنجاح",
      };
    }

    return {
      success: false,
      error: res.error || res.message || "فشل تعديل الحساب",
    };
  } catch (error: any) {
    console.error(`❌ Error updating admin account [${id}]:`, error);
    return {
      success: false,
      error: error?.message || "حدث خطأ غير متوقع أثناء تعديل الحساب",
    };
  }
}

/**
 * حذف حساب أدمن
 */
export async function deleteAdmin(
  id: string | number,
  token?: string | null
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await apiClient<any>(
      `/admin/admins/${id}`,
      {
        method: "DELETE",
      },
      token
    );

    if (res.success) {
      return {
        success: true,
        message: res.message || "تم حذف الحساب بنجاح",
      };
    }

    return {
      success: false,
      error: res.error || res.message || "فشل حذف الحساب",
    };
  } catch (error: any) {
    console.error(`❌ Error deleting admin account [${id}]:`, error);
    return {
      success: false,
      error: error?.message || "حدث خطأ أثناء حذف الحساب",
    };
  }
}

/**
 * جلب قائمة المستخدمين النهائيين
 */
export async function fetchEndUsers(
  token?: string | null,
  page?: number
): Promise<{ users: IEndUser[]; pagination?: IPaginationMeta }> {
  try {
    const url = page ? `/admin/end-users?page=${page}` : `/admin/end-users`;
    const res = await apiClient<any>(url, { silent: true }, token);

    if (res.success && res.data) {
      let rawList: any[] = [];
      let pagination: IPaginationMeta | undefined = undefined;

      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        rawList = res.data.data;
        pagination = {
          current_page: Number(res.data.current_page) || (page || 1),
          last_page: Number(res.data.last_page) || 1,
          per_page: Number(res.data.per_page) || 15,
          total: Number(res.data.total) || rawList.length,
          from: res.data.from,
          to: res.data.to,
        };
      }

      const users: IEndUser[] = rawList.map((item) => ({
        id: item.id || "",
        email: item.email || "",
        name: item.name || "",
        admin_id: item.admin_id || null,
        auth_id: item.auth_id || null,
        email_confirmed_at: item.email_confirmed_at || null,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || item.created_at || new Date().toISOString(),
      }));

      return { users, pagination };
    }

    return { users: [] };
  } catch (error) {
    return { users: [] };
  }
}

/**
 * حذف مستخدم نهائي
 */
export async function deleteEndUser(
  id: string,
  token?: string | null
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await apiClient<any>(
      `/admin/end-users/${id}`,
      {
        method: "DELETE",
      },
      token
    );

    if (res.success) {
      return {
        success: true,
        message: res.message || "تم حذف المستخدم بنجاح",
      };
    }

    return {
      success: false,
      error: res.error || res.message || "فشل حذف المستخدم",
    };
  } catch (error: any) {
    console.error(`❌ Error deleting end user [${id}]:`, error);
    return {
      success: false,
      error: error?.message || "حدث خطأ أثناء حذف المستخدم",
    };
  }
}
