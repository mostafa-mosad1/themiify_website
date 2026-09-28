// app/admin/platforms/page.tsx
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import TablePage from "@/components/ui/TablePage";
import {
  fetchPlatforms,
  createPlatform as apiCreatePlatform,
  updatePlatform as apiUpdatePlatform,
  deletePlatform as apiDeletePlatform,
  platformTableColumns,
  platformAddFields,
  platformEditFields,
  formatPlatforms,
  formatPlatformsForEdit,
  getPlatformStats,
} from "@/features/platforms";

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

  const formattedPlatforms = formatPlatforms(platforms);
  const platformsForEdit = formatPlatformsForEdit(platforms);
  const stats = getPlatformStats(platforms, pagination?.total);

  return (
    <TablePage
      title="platforms"
      description="إدارة المنصات المدعومة للثيمات"
      data={formattedPlatforms}
      editData={platformsForEdit}
      columns={platformTableColumns}
      stats={stats}
      pagination={pagination}
      itemsPerPage={15}
      onAdd={createPlatform}
      onEdit={updatePlatform}
      onDelete={deletePlatform}
      addModalFields={platformAddFields}
      editModalFields={platformEditFields}
      idKey="id"
    />
  );
}
