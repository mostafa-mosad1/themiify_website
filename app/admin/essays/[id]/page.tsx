// app/admin/essays/[id]/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import { FaArrowRight, FaEdit, FaCalendar } from "react-icons/fa";
import { fetchAdminBlogById, formatEssayDate } from "@/features/essays";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "تفاصيل المقالة | لوحة التحكم",
};

interface EssayDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EssayDetailPage({
  params,
}: EssayDetailPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const serverToken =
    cookieStore.get("authToken")?.value ||
    cookieStore.get("adminToken")?.value ||
    cookieStore.get("bearer_token")?.value ||
    null;

  const blog = await fetchAdminBlogById(id, serverToken);

  if (!blog) {
    notFound();
  }

  return (
    <div
      className="w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100 dark:border-zinc-800 shadow-sm"
      dir="rtl"
    >
      {/* ─── Header with Back Button ─────────────────────────── */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <Link prefetch={false}
          href="/admin/essays"
          className="p-2 rounded-xl text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          title="الرجوع إلى المقالات"
        >
          <FaArrowRight className="text-lg" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          تفاصيل المقالة
        </h1>
      </div>

      {/* ─── Essay Content ─────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {blog.title || blog.name}
          </h2>
          {blog.category && (
            <span className="inline-block bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
              {blog.category}
            </span>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <FaCalendar className="text-orange-500" />
          <span>{formatEssayDate(blog.created_at)}</span>
        </div>

        {/* Image */}
        {blog.image_url && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.image_url}
              alt={blog.title || blog.name}
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        {/* Description */}
        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            الوصف
          </h3>
          <p className="text-gray-900 dark:text-white leading-relaxed">
            {blog.description}
          </p>
        </div>

        {/* Content */}
        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            المحتوى
          </h3>
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-white leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content || "" }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Link prefetch={false}
            href={`/admin/essays/edit/${blog.id}`}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <FaEdit />
            <span>تعديل</span>
          </Link>
          <Link prefetch={false}
            href="/admin/essays"
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <span>عودة</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
