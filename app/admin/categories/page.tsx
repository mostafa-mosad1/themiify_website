// app/admin/categories/page.tsx
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import TablePage from "@/components/ui/TablePage";
import { MdCategory } from "react-icons/md";
import { FaClock } from "react-icons/fa";
import {
  fetchCategories,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  ICategory,
} from "@/lib/api/categories";

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

  const formattedCategories = (categories || []).map((cat: ICategory) => ({
    id: cat.id,
    name: cat.name || "بدون اسم",
    icon: cat.icon || "icon-code",
    image: cat.image_url || cat.image || null,
    image_url: cat.image_url || cat.image || null,
    created_at: formatDate(cat.created_at),
  }));

  const categoriesForEdit = (categories || []).map((cat: ICategory) => ({
    id: cat.id,
    name: cat.name || "",
    icon: cat.icon || "icon-code",
  }));

  const stats = [
    {
      label: "إجمالي الأقسام",
      value: pagination?.total ?? (categories?.length || 0),
      icon: <MdCategory className="text-primary text-2xl" />,
      color: "primary",
    },
    {
      label: "آخر تحديث",
      value:
        categories && categories.length > 0
          ? formatDate(categories[0].created_at)
          : "لا يوجد",
      icon: <FaClock className="text-green-500 text-2xl" />,
      color: "green",
    },
  ];

  const columns = [
    { key: "id", label: "ID", type: "text" as const },
    { key: "icon", label: "الأيقونة", type: "icon" as const },
    { key: "name", label: "اسم القسم", type: "text" as const },
    { key: "created_at", label: "تاريخ الإنشاء", type: "text" as const },
    { key: "actions", label: "الإجراءات", type: "actions" as const },
  ];

  const addFields = [
    {
      name: "name",
      label: "اسم القسم / التصنيف",
      type: "text" as const,
      required: true,
      placeholder: "مثال: قسم البرمجيات",
    },
    {
      name: "icon",
      label: "أيقونة القسم",
      type: "icon" as const,
      required: true,
      defaultValue: "icon-code",
    },
  ];

  const editFields = [
    {
      name: "name",
      label: "اسم القسم / التصنيف",
      type: "text" as const,
      required: true,
      placeholder: "مثال: قسم البرمجيات",
    },
    {
      name: "icon",
      label: "أيقونة القسم",
      type: "icon" as const,
      required: true,
      defaultValue: "icon-code",
    },
  ];

  return (
    <TablePage
      title="categories"
      description="إدارة الأقسام والتصنيفات"
      data={formattedCategories}
      editData={categoriesForEdit}
      columns={columns}
      stats={stats}
      pagination={pagination}
      itemsPerPage={15}
      onAdd={createCategory}
      onEdit={updateCategory}
      onDelete={deleteCategory}
      addModalFields={addFields}
      editModalFields={editFields}
      idKey="id"
    />
  );
}
