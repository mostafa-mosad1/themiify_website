"use client";
import { useEffect, useState } from "react";
import { FaYoutube } from "react-icons/fa";
import { FaChevronLeft } from "react-icons/fa6";
import Button from "@/components/ui/Button";

interface YoutubeInfo {
  channelName: string;
  channelUrl: string;
  thumbnailUrl: string;
  authorUrl: string;
}

function getVideoId(url: string): string {
  if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
  if (url.includes("youtube.com/embed/")) return url.split("embed/")[1].split("?")[0];
  return "";
}

export default function YoutubeChannelCard({
  videoUrl,
  themeName,
  themelist,
}: {
  videoUrl?: string;
  themeName?: string;
  themelist?: string;
}) {
  const [info, setInfo] = useState<YoutubeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoUrl) return;
    const fetchOEmbed = async () => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`,
        );
        const data = await res.json();
        const videoId = getVideoId(videoUrl);
        setInfo({
          channelName: data.author_name,
          channelUrl: data.author_url,
          authorUrl: data.author_url,
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        });
      } catch (err) {
        console.error("فشل جلب بيانات يوتيوب:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOEmbed();
  }, [videoUrl]);

  if (!videoUrl) return null;

  if (loading) {
    return (
      <div className="bg-[var(--bg-primary)] rounded-2xl p-4 border border-[var(--border-color)] shadow-sm animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-32" />
            <div className="h-2.5 bg-[var(--bg-secondary)] rounded w-20" />
          </div>
        </div>
        <div className="h-3 bg-[var(--bg-secondary)] rounded w-full mb-1.5" />
        <div className="h-3 bg-[var(--bg-secondary)] rounded w-3/4" />
      </div>
    );
  }

  if (!info) return null;

  const handle = info.channelUrl
    ? "@" + (info.channelUrl.split("@")[1] || info.channelName.replace(/\s/g, ""))
    : "@" + info.channelName.replace(/\s/g, "");

  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-4 h-48 w-full mt-4">
      {/* Header */}
      <div className="flex items-center gap-[10px] mb-3">
        <div className="w-10 h-7 flex items-center justify-center rounded-full">
          <FaYoutube className="text-red-600 text-3xl w-full" />
        </div>
        <div className="text-right">
          <p className="font-semibold text-[var(--text-primary)] text-base">
            {info.channelName}
          </p>
          <p className="text-[var(--text-secondary)] text-xs">{handle}</p>
        </div>
      </div>

      {/* وصف */}
      <p className="text-[var(--text-primary)] text-sm text-right leading-relaxed mb-4 font-semibold">
        فيديوهات قصيرة بشرحلك إزاي تستخدم ثيم {themeName} من غير تعقيد تقني
      </p>

      {/* زر مشاهدة القناة */}
      <Button
        variant="solid"
        url={themelist}
        openInNewTab
        className="product-card__button product-card__button--buy flex items-center justify-center text-[var(--primary-color)] buyCardBtn w-36 h-10 [&_.btn-con]:!w-full"
      >
        <span className="flex items-center justify-center gap-1 w-full h-full">
          <span className="text-[var(--primary-color)] font-bold text-sm">مشاهدة القناة</span>
          <FaChevronLeft className="text-[var(--primary-color)] font-bold text-sm" size={12} />
        </span>
      </Button>
    </div>
  );
}