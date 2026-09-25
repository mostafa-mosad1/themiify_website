// app/admin/accounts/actions.ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  createAdmin as apiCreateAdmin,
  updateAdmin as apiUpdateAdmin,
  deleteAdmin as apiDeleteAdmin,
  fetchAdminById as apiFetchAdminById,
} from "@/lib/api/admins";

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get("authToken")?.value ||
    cookieStore.get("adminToken")?.value ||
    cookieStore.get("bearer_token")?.value ||
    null
  );
}

export async function createAccount(formData: FormData) {
  const token = await getAuthToken();
  const res = await apiCreateAdmin(formData, token);
  if (res.success) {
    revalidatePath("/admin/accounts");
  }
  return res;
}

export async function updateAccount(formData: FormData) {
  const id = formData.get("original_id") as string;
  const token = await getAuthToken();
  const res = await apiUpdateAdmin(id, formData, token);
  if (res.success) {
    revalidatePath("/admin/accounts");
  }
  return res;
}

export async function deleteAccount(id: string | number) {
  const token = await getAuthToken();
  const res = await apiDeleteAdmin(id, token);
  if (res.success) {
    revalidatePath("/admin/accounts");
  }
  return res;
}

export async function getAccountDetails(id: string | number) {
  const token = await getAuthToken();
  const admin = await apiFetchAdminById(id, token);
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