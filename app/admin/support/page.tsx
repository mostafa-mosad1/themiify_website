import { cookies } from "next/headers";
import SupportAdminPanel from "@/components/ui/SupportAdminPanel";
import { fetchAdminSupportCategories } from "@/lib/api/support-categories";
import { fetchAdminSupportQuestions } from "@/lib/api/support-questions";
import { fetchAdminSupportChannels } from "@/lib/api/support-channels";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("authToken")?.value ||
    cookieStore.get("adminToken")?.value ||
    cookieStore.get("bearer_token")?.value ||
    null;

  const [categories, questionsRes, channelsRes] = await Promise.all([
    fetchAdminSupportCategories(token),
    fetchAdminSupportQuestions(token),
    fetchAdminSupportChannels(token),
  ]);

  return (
    <div className="" dir="rtl">
      <SupportAdminPanel 
        initialCategories={categories || []}
        initialQuestions={questionsRes.questions || []}
        initialChannels={channelsRes.channels || []}
        isSuperAdmin={true}
      />
    </div>
  );
}