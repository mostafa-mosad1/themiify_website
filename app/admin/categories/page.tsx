// app/admin/categories/page.tsx
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import TablePage from "@/components/ui/TablePage";
import {
  fetchCategories,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  categoryTableColumns,
  categoryAddFields,
  categoryEditFields,
  formatCategories,
  formatCategoriesForEdit,
  getCategoryStats,
} from "@/features/categories";

async function getAuthTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get("authToken")?.value ||
    cookieStore.get("adminToken")?.value ||
    cookieStore.get("bearer_token")?.value ||
    null
  );
}

interface CategoriesPageProps {
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pageParam = resolvedSearchParams?.page;
  const page = typeof pageParam === "string" ? parseInt(pageParam, 10) || 1 : 1;

  const token = await getAuthTokenFromCookies();
  const { categories, pagination } = await fetchCategories(token, page);

  async function createCategory(formData: FormData) {
    "use server";
    const serverToken = await getAuthTokenFromCookies();
    const result = await apiCreateCategory(formData, serverToken);
    if (result.success) {
      revalidatePath("/admin/categories");
      revalidatePath("/themes");
    }
    return result;
  }

  async function updateCategory(formData: FormData) {
    "use server";
    const id = formData.get("original_id") as string;
    const serverToken = await getAuthTokenFromCookies();
    const result = await apiUpdateCategory(id, formData, serverToken);
    if (result.success) {
      revalidatePath("/admin/categories");
      revalidatePath("/themes");
    }
    return result;
  }

  async function deleteCategory(id: string) {
    "use server";
    const serverToken = await getAuthTokenFromCookies();
    const result = await apiDeleteCategory(id, serverToken);
    if (result.success) {
      revalidatePath("/admin/categories");
      revalidatePath("/themes");
    }
    return result;
  }

  const formattedCategories = formatCategories(categories);
  const categoriesForEdit = formatCategoriesForEdit(categories);
  const stats = getCategoryStats(categories, pagination?.total);

  return (
    <TablePage
      title="categories"
      description="إدارة الأقسام والتصنيفات"
      data={formattedCategories}
      editData={categoriesForEdit}
      columns={categoryTableColumns}
      stats={stats}
      pagination={pagination}
      itemsPerPage={15}
      onAdd={createCategory}
      onEdit={updateCategory}
      onDelete={deleteCategory}
      addModalFields={categoryAddFields}
      editModalFields={categoryEditFields}
      idKey="id"
    />
  );
}
