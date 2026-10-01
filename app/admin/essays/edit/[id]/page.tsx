import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import EditEssayClient from "../EditEssayClient";
import {
  fetchAdminBlogById,
  updateAdminBlog,
  formatEssayEditData,
} from "@/features/essays";
import { fetchAdminSupportCategories } from "@/lib/api/support-categories";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "تعديل المقالة | لوحة التحكم",
};

interface EditEssayPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEssayPage({ params }: EditEssayPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const serverToken =
    cookieStore.get("authToken")?.value ||
    cookieStore.get("adminToken")?.value ||
    cookieStore.get("bearer_token")?.value ||
    null;

  const [blog, categories] = await Promise.all([
    fetchAdminBlogById(id, serverToken),
    fetchAdminSupportCategories(serverToken),
  ]);

  if (!blog) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            المقالة غير موجودة
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            تعذر العثور على المقالة برقم التعريف: {id}
          </p>
          <Link prefetch={false}
            href="/admin/essays"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            العودة للمقالات
          </Link>
        </div>
      </div>
    );
  }

  async function updateEssay(formData: FormData) {
    "use server";

    const actionCookieStore = await cookies();
    const actionToken =
      actionCookieStore.get("authToken")?.value ||
      actionCookieStore.get("adminToken")?.value ||
      actionCookieStore.get("bearer_token")?.value ||
      (formData.get("bearer_token") as string) ||
      null;

    const idValue = formData.get("original_id") as string;

    const titleVal = (formData.get("title") || formData.get("name")) as string;
    if (titleVal) {
      formData.set("title", titleVal);
      formData.set("name", titleVal);
    }

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

    const result = await updateAdminBlog(idValue, formData, actionToken);
    if (result.success) {
      revalidatePath("/admin/essays");
      revalidatePath(`/admin/essays/edit/${idValue}`);
      revalidatePath(`/admin/essays/${idValue}`);
      revalidatePath("/essays");
      revalidatePath(`/essays/${idValue}`);
    }
    return result;
  }

  const initialData = formatEssayEditData(blog);

  return (
    <EditEssayClient
      onSave={updateEssay}
      initialData={initialData}
      initialCategories={categories || []}
    />
  );
}
