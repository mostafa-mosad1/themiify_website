// app/admin/platforms/page.tsx
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import TablePage from "@/components/ui/TablePage";
import { FaGlobe, FaClock } from "react-icons/fa";
import {
  fetchPlatforms,
  createPlatform as apiCreatePlatform,
  updatePlatform as apiUpdatePlatform,
  deletePlatform as apiDeletePlatform,
  IPlatform,
} from "@/lib/api/platforms";

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

interface PlatformsPageProps {
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}

export default async function PlatformsPage({ searchParams }: PlatformsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pageParam = resolvedSearchParams?.page;
  const page = typeof pageParam === "string" ? parseInt(pageParam, 10) || 1 : 1;

  const token = await getAuthTokenFromCookies();
  const { platforms, pagination } = await fetchPlatforms(token, page);

  async function createPlatform(formData: FormData) {
    "use server";
    const serverToken = await getAuthTokenFromCookies();
    const result = await apiCreatePlatform(formData, serverToken);
    if (result.success) {
      revalidatePath("/admin/platforms");
      revalidatePath("/admin/themes");
      revalidatePath("/themes");
      revalidatePath("/", "layout");
    }
    return result;
  }

  async function updatePlatform(formData: FormData) {
    "use server";
    const id = (formData.get("original_id") || formData.get("id")) as string;
    const serverToken = await getAuthTokenFromCookies();
    const result = await apiUpdatePlatform(id, formData, serverToken);
    if (result.success) {
      revalidatePath("/admin/platforms");
      revalidatePath("/admin/themes");
      revalidatePath("/themes");
      revalidatePath("/", "layout");
    }
    return result;
  }

  async function deletePlatform(id: string) {
    "use server";
    const serverToken = await getAuthTokenFromCookies();
    const result = await apiDeletePlatform(id, serverToken);
    if (result.success) {
      revalidatePath("/admin/platforms");
      revalidatePath("/admin/themes");
      revalidatePath("/themes");
      revalidatePath("/", "layout");
    }
    return result;
  }

  const formattedPlatforms = (platforms || []).map((p: IPlatform) => ({
    id: p.id,
    name: p.name || "بدون اسم",
    created_at: formatDate(p.created_at),
  }));

  const platformsForEdit = (platforms || []).map((p: IPlatform) => ({
    id: p.id,
    name: p.name || "",
  }));

  const stats = [
    {
      label: "إجمالي المنصات",
      value: pagination?.total ?? (platforms?.length || 0),
      icon: <FaGlobe className="text-primary text-2xl" />,
      color: "primary",
    },
    {
      label: "آخر تحديث",
      value:
        platforms && platforms.length > 0
          ? formatDate(platforms[0].created_at)
          : "لا يوجد",
      icon: <FaClock className="text-green-500 text-2xl" />,
      color: "green",
    },
  ];

  const columns = [
    { key: "id", label: "ID", type: "text" as const },
    { key: "name", label: "اسم المنصة", type: "text" as const },
    { key: "created_at", label: "تاريخ الإنشاء", type: "text" as const },
    { key: "actions", label: "الإجراءات", type: "actions" as const },
  ];

  const addFields = [
    {
      name: "name",
      label: "اسم المنصة",
      type: "text" as const,
      required: true,
      placeholder: "مثال: Salla أو Zid أو Shopify",
    },
  ];

  const editFields = [
    {
      name: "name",
      label: "اسم المنصة",
      type: "text" as const,
      required: true,
      placeholder: "مثال: Salla أو Zid أو Shopify",
    },
  ];

  return (
    <TablePage
      title="platforms"
      description="إدارة المنصات المدعومة للثيمات"
      data={formattedPlatforms}
      editData={platformsForEdit}
      columns={columns}
      stats={stats}
      pagination={pagination}
      itemsPerPage={15}
      onAdd={createPlatform}
      onEdit={updatePlatform}
      onDelete={deletePlatform}
      addModalFields={addFields}
      editModalFields={editFields}
      idKey="id"
    />
  );
}
