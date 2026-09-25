// app/admin//page.tsx
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import AdminEssaysClient from "./AdminEssaysClient";
import { fetchAdminBlogs, deleteAdminBlog } from "@/lib/api/blogs";
import { fetchAdminSupportCategories } from "@/lib/api/support-categories";

async function getAuthTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get("authToken")?.value ||
    cookieStore.get("adminToken")?.value ||
    cookieStore.get("bearer_token")?.value ||
    null
  );
}

interface EssaysPageProps {
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}

export default async function EssaysPage({ searchParams }: EssaysPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pageParam = resolvedSearchParams?.page;
  const rawPage = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const parsedPage =
    typeof rawPage === "string" ? Number.parseInt(rawPage, 10) : 1;
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const token = await getAuthTokenFromCookies();
  const [{ blogs: essays, pagination }, categories] = await Promise.all([
    fetchAdminBlogs(token, page),
    fetchAdminSupportCategories(token),
  ]);

  // Server Action: حذف مقالة
  async function deleteEssay(id: string) {
    "use server";
    const serverToken = await getAuthTokenFromCookies();
    const result = await deleteAdminBlog(id, serverToken);
    if (result.success) {
      revalidatePath("/admin/essays");
      revalidatePath("/essays");
    }
    return result;
  }

  return (
    <div className="essays w-full">
      <Suspense
        fallback={
          <div className="w-full h-96 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <AdminEssaysClient
          initialEssays={essays || []}
          initialCategories={categories || []}
          pagination={pagination}
          onDelete={deleteEssay}
        />
      </Suspense>
    </div>
  );
}
