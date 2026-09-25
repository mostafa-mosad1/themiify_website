import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import AddEssayClient from "./AddEssayClient";
import { createAdminBlog } from "@/lib/api/blogs";
import { fetchAdminSupportCategories } from "@/lib/api/support-categories";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "إضافة مقالة جديدة | لوحة التحكم",
};

export default async function AddEssayPage() {
  const cookieStore = await cookies();
  const serverToken =
    cookieStore.get("authToken")?.value ||
    cookieStore.get("adminToken")?.value ||
    cookieStore.get("bearer_token")?.value ||
    null;

  const categories = await fetchAdminSupportCategories(serverToken);

  async function createEssay(formData: FormData) {
    "use server";

    const actionCookieStore = await cookies();
    const actionToken =
      actionCookieStore.get("authToken")?.value ||
      actionCookieStore.get("adminToken")?.value ||
      actionCookieStore.get("bearer_token")?.value ||
      (formData.get("bearer_token") as string) ||
      null;

    // Sync title and name
    const titleVal = (formData.get("title") || formData.get("name")) as string;
    if (titleVal) {
      formData.set("title", titleVal);
      formData.set("name", titleVal);
    }

    // إرسال description و content كما هم بدون sync
    const descVal = (formData.get("description") || "") as string;
    const contentVal = (formData.get("content") || "") as string;

    if (descVal) {
      formData.set("description", descVal);
    }
    if (contentVal) {
      formData.set("content", contentVal);
    }

    // ضبط category_id
    const catIdVal = formData.get("category_id") || formData.get("category");
    if (catIdVal && !isNaN(Number(catIdVal))) {
      formData.set("category_id", String(catIdVal));
      formData.delete("category");
    } else {
      formData.delete("category");
      formData.delete("category_id");
    }

    const result = await createAdminBlog(formData, actionToken);
    if (result.success) {
      revalidatePath("/admin/essays");
      revalidatePath("/essays");
    }
    return result;
  }

  return (
    <AddEssayClient onSave={createEssay} initialCategories={categories || []} />
  );
}
