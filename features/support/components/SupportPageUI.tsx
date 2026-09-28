/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(client)/support/SupportPageUI.tsx
"use client";

import Image from "next/image";
import support from "@/public/images/support.png";
import formBanner from "@/public/images/ban.png";
import formBannerRes from "@/public/images/banres.png";
import faq from "@/public/images/faqIcon.svg";
import gmail from "@/public/images/gmail.jpg";
import telegram from "@/public/images/telegram.jpg";
import whatsapp from "@/public/images/whatsapp.png";
import snapchat from "@/public/images/Snapchat.png";
import { useState, useEffect, useMemo } from "react";
import { FiChevronDown, FiClock } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import {
  FaTiktok,
  FaInstagram,
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaDiscord,
  FaThreads,
  FaGithub,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaTelegram,
  FaSnapchat,
} from "react-icons/fa6";
import Button from "@/components/ui/Button";
import {
  fetchSupportQuestions,
  ISupportQuestion,
  normalizeSupportQuestion,
} from "@/lib/api/support-questions";
import {
  fetchSupportClientCategories,
  ISupportCategory,
} from "@/lib/api/support-categories";
import {
  fetchSupportChannels,
  ISupportChannel,
} from "@/lib/api/support-channels";

const FEEDBACK_COOLDOWN_MINUTES = 10;

// أيقونات التواصل - صور محلية
const iconImages: Record<string, any> = {
  whatsapp: whatsapp,
  telegram: telegram,
  email: gmail,
  snapchat: snapchat,
};

// أيقونات التواصل - React Icons
const iconComponents: Record<string, any> = {
  tiktok: FaTiktok,
  instagram: FaInstagram,
  twitter: FaXTwitter,
  facebook: FaFacebook,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  discord: FaDiscord,
  threads: FaThreads,
  github: FaGithub,
  globe: FaGlobe,
  website: FaGlobe,
  phone: FaPhone,
  email: FaEnvelope,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  snapchat: FaSnapchat,
};

// ألوان الهوية لكل منصة
const platformColors: Record<string, string> = {
  whatsapp: "#25D366",
  telegram: "#229ED9",
  email: "#EA4335",
  snapchat: "#FFFC00",
  instagram: "#E1306C",
  tiktok: "#000000",
  twitter: "#000000",
  facebook: "#1877F2",
  youtube: "#FF0000",
  linkedin: "#0A66C2",
  discord: "#5865F2",
  threads: "#000000",
  github: "#24292e",
  phone: "#25D366",
  website: "#f26b21",
};

export interface FormattedSocialChannel {
  id: number;
  name: string;
  type: string;
  value: string;
  rawValue: string;
  icon: string;
  customIconUrl?: string | null;
}

/**
 * استنتاج نوع المنصة بدقة من الاسم، النوع، أو الأيقونة
 */
function detectChannelPlatform(c: ISupportChannel): string {
  const iconStr = (c.icon || "").toLowerCase();
  const nameLower = (c.name || "").toLowerCase();
  const typeLower = (c.type || "").toLowerCase();

  if (
    iconStr.includes("whatsapp") ||
    typeLower.includes("whatsapp") ||
    nameLower.includes("واتساب") ||
    nameLower.includes("واتس") ||
    typeLower === "واتساب"
  ) {
    return "whatsapp";
  }
  if (
    iconStr.includes("telegram") ||
    typeLower.includes("telegram") ||
    nameLower.includes("تليجرام") ||
    nameLower.includes("تيليجرام") ||
    nameLower.includes("تلغرام") ||
    typeLower === "تليجرام"
  ) {
    return "telegram";
  }
  if (
    iconStr.includes("snapchat") ||
    typeLower.includes("snapchat") ||
    nameLower.includes("سناب") ||
    typeLower === "سناب شات"
  ) {
    return "snapchat";
  }
  if (
    iconStr.includes("email") ||
    iconStr.includes("envelope") ||
    iconStr.includes("gmail") ||
    typeLower.includes("email") ||
    nameLower.includes("بريد") ||
    nameLower.includes("ايميل") ||
    nameLower.includes("إيميل") ||
    typeLower === "بريد إلكتروني"
  ) {
    return "email";
  }
  if (
    iconStr.includes("phone") ||
    typeLower.includes("phone") ||
    nameLower.includes("هاتف") ||
    nameLower.includes("اتصال") ||
    nameLower.includes("جوال") ||
    typeLower === "هاتف"
  ) {
    return "phone";
  }
  if (
    iconStr.includes("instagram") ||
    typeLower.includes("instagram") ||
    nameLower.includes("انستغرام") ||
    nameLower.includes("انستقرام")
  ) {
    return "instagram";
  }
  if (
    iconStr.includes("tiktok") ||
    typeLower.includes("tiktok") ||
    nameLower.includes("تيك توك")
  ) {
    return "tiktok";
  }
  if (
    iconStr.includes("twitter") ||
    iconStr.includes("x-twitter") ||
    typeLower.includes("twitter") ||
    nameLower.includes("تويتر") ||
    nameLower.includes("إكس") ||
    nameLower.includes("اكس")
  ) {
    return "twitter";
  }
  if (
    iconStr.includes("facebook") ||
    typeLower.includes("facebook") ||
    nameLower.includes("فيسبوك") ||
    nameLower.includes("فيس بوك")
  ) {
    return "facebook";
  }
  if (
    iconStr.includes("youtube") ||
    typeLower.includes("youtube") ||
    nameLower.includes("يوتيوب")
  ) {
    return "youtube";
  }
  if (
    iconStr.includes("linkedin") ||
    typeLower.includes("linkedin") ||
    nameLower.includes("لينكد")
  ) {
    return "linkedin";
  }
  if (
    iconStr.includes("discord") ||
    typeLower.includes("discord") ||
    nameLower.includes("ديسكورد")
  ) {
    return "discord";
  }
  if (
    iconStr.includes("threads") ||
    typeLower.includes("threads") ||
    nameLower.includes("ثريدز")
  ) {
    return "threads";
  }
  if (
    iconStr.includes("github") ||
    typeLower.includes("github") ||
    nameLower.includes("جيت")
  ) {
    return "github";
  }
  if (
    iconStr.includes("globe") ||
    iconStr.includes("website") ||
    typeLower.includes("website") ||
    nameLower.includes("موقع")
  ) {
    return "website";
  }
  return "website";
}

/**
 * بناء رابط صالح وقابل للضغط لكل منصة بحسب القيمة المدخلة
 */
function buildChannelUrl(platform: string, val: string): string {
  const raw = (val || "").trim();
  if (!raw) return "#";

  if (platform === "whatsapp") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }
    if (raw.startsWith("wa.me/")) {
      return `https://${raw}`;
    }
    const cleanNumber = raw.replace(/[^0-9]/g, "");
    if (cleanNumber) {
      let finalNum = cleanNumber;
      if (finalNum.startsWith("05") && finalNum.length === 10) {
        finalNum = `966${finalNum.slice(1)}`;
      } else if (finalNum.startsWith("00")) {
        finalNum = finalNum.slice(2);
      }
      return `https://wa.me/${finalNum}`;
    }
    // في حال كانت القيمة نصية وليست رقماً، يتم فتح واتساب مع تجهيز النص كرسالة
    return `https://wa.me/?text=${encodeURIComponent(raw)}`;
  }

  if (platform === "telegram") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }
    if (raw.startsWith("t.me/")) {
      return `https://${raw}`;
    }
    const username = raw.replace(/^@/, "");
    return `https://t.me/${username}`;
  }

  if (platform === "snapchat") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }
    if (raw.startsWith("snapchat.com/")) {
      return `https://${raw}`;
    }
    const username = raw.replace(/^@/, "");
    return `https://www.snapchat.com/add/${username}`;
  }

  if (platform === "email") {
    if (raw.startsWith("mailto:")) {
      return raw;
    }
    return `mailto:${raw}`;
  }

  if (platform === "phone") {
    if (raw.startsWith("tel:")) {
      return raw;
    }
    return `tel:${raw.replace(/\s+/g, "")}`;
  }

  if (platform === "instagram") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("instagram.com/")) return `https://${raw}`;
    return `https://instagram.com/${raw.replace(/^@/, "")}`;
  }

  if (platform === "tiktok") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("tiktok.com/")) return `https://${raw}`;
    return `https://tiktok.com/@${raw.replace(/^@/, "")}`;
  }

  if (platform === "twitter") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("x.com/") || raw.startsWith("twitter.com/"))
      return `https://${raw}`;
    return `https://x.com/${raw.replace(/^@/, "")}`;
  }

  if (platform === "facebook") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("facebook.com/")) return `https://${raw}`;
    return `https://facebook.com/${raw.replace(/^@/, "")}`;
  }

  if (platform === "youtube") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("youtube.com/")) return `https://${raw}`;
    if (raw.startsWith("@")) return `https://youtube.com/${raw}`;
    return `https://youtube.com/@${raw}`;
  }

  if (platform === "linkedin") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("linkedin.com/")) return `https://${raw}`;
    return `https://linkedin.com/in/${raw.replace(/^@/, "")}`;
  }

  if (platform === "discord") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("discord.gg/")) return `https://${raw}`;
    return `https://discord.gg/${raw.replace(/^@/, "")}`;
  }

  if (platform === "threads") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("threads.net/")) return `https://${raw}`;
    return `https://threads.net/@${raw.replace(/^@/, "")}`;
  }

  if (platform === "github") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("github.com/")) return `https://${raw}`;
    return `https://github.com/${raw.replace(/^@/, "")}`;
  }

  // موقع عام / رابط خارجي
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  return `https://${raw}`;
}

export default function SupportPageUI() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackMinutesRemaining, setFeedbackMinutesRemaining] = useState(0);

  const [questionsData, setQuestionsData] = useState<ISupportQuestion[]>([]);
  const [categoriesData, setCategoriesData] = useState<ISupportCategory[]>([]);
  const [socialLinksData, setSocialLinksData] = useState<
    FormattedSocialChannel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    "all",
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsRes, categoriesRes, channelsRes] = await Promise.all([
          fetchSupportQuestions(),
          fetchSupportClientCategories(),
          fetchSupportChannels(),
        ]);

        const loadedQuestions: ISupportQuestion[] =
          questionsRes.questions || [];
        const loadedCategories: ISupportCategory[] = categoriesRes || [];

        // في حال كانت قائمة الأسئلة فارغة لكن الفئات تحتوي على مصفوفة questions
        if (loadedQuestions.length === 0 && loadedCategories.length > 0) {
          for (const cat of loadedCategories) {
            if (Array.isArray(cat.questions)) {
              for (const q of cat.questions) {
                const norm = normalizeSupportQuestion({
                  ...(q as Record<string, unknown>),
                  category_id:
                    (q as Record<string, unknown>).category_id || cat.id,
                  category_name: cat.name,
                  category: { id: cat.id, name: cat.name },
                });
                if (norm) loadedQuestions.push(norm);
              }
            }
          }
        }

        // في حال كانت الفئات فارغة لكن الأسئلة متوفرة ولها فئات
        let finalCategories = loadedCategories;
        if (finalCategories.length === 0 && loadedQuestions.length > 0) {
          const map = new Map<number, ISupportCategory>();
          for (const q of loadedQuestions) {
            if (q.category && q.category.id) {
              if (!map.has(q.category.id)) {
                map.set(q.category.id, {
                  id: q.category.id,
                  name: q.category.name || `قسم ${q.category.id}`,
                  order_index: 0,
                  is_active: true,
                });
              }
            }
          }
          finalCategories = Array.from(map.values());
        }

        setQuestionsData(loadedQuestions);
        setCategoriesData(finalCategories);

        if (channelsRes.channels && channelsRes.channels.length > 0) {
          const active = channelsRes.channels.filter(
            (c) => c.is_active !== false,
          );
          if (active.length > 0) {
            const formatted: FormattedSocialChannel[] = active.map((c) => {
              const platform = detectChannelPlatform(c);
              const href = buildChannelUrl(platform, c.value);

              const iconRaw = (c.icon || "").trim();
              const isCustomUrl =
                iconRaw.startsWith("http://") ||
                iconRaw.startsWith("https://") ||
                iconRaw.startsWith("/");

              return {
                id: c.id,
                name: c.name || platform,
                type: c.type || platform,
                value: href,
                rawValue: c.value,
                icon: platform,
                customIconUrl: isCustomUrl ? iconRaw : null,
              };
            });
            setSocialLinksData(formatted);
          }
        }
      } catch (error) {
        console.error("Error fetching support data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const ts = localStorage.getItem("feedback_submitted_at");
    if (ts) {
      const elapsed = Date.now() - parseInt(ts, 10);
      if (elapsed < FEEDBACK_COOLDOWN_MINUTES * 60 * 1000) {
        setHasSubmitted(true);
      }
    }
  }, []);

  const toggleQuestion = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleSubmittedFeedbackClick = () => {
    const timestamp = localStorage.getItem("feedback_submitted_at");
    const remaining = timestamp
      ? FEEDBACK_COOLDOWN_MINUTES * 60 * 1000 - (Date.now() - parseInt(timestamp, 10))
      : 0;

    setFeedbackMinutesRemaining(Math.ceil(Math.max(remaining, 0) / 60000));
    setShowFeedbackPopup(true);
  };

  const renderSocialIcon = (link: FormattedSocialChannel) => {
    if (link.customIconUrl) {
      return (
        <Image
          src={link.customIconUrl}
          alt={link.name}
          width={22}
          height={22}
          unoptimized
          className="size-[22px] object-contain rounded-full"
        />
      );
    }
    if (iconImages[link.icon]) {
      return (
        <Image
          src={iconImages[link.icon]}
          alt={link.name}
          width={22}
          height={22}
          className="object-contain"
        />
      );
    }
    const IconComponent = iconComponents[link.icon] || FaGlobe;
    const color = platformColors[link.icon] || undefined;
    return <IconComponent size={22} style={color ? { color } : undefined} />;
  };

  const filteredQuestions = useMemo(() => {
    const activeQuestions = questionsData.filter((q) => q.is_active !== false);
    if (selectedCategoryId === "all") {
      return activeQuestions;
    }
    const filtered = activeQuestions.filter((q) => {
      if (q.category_id === selectedCategoryId) return true;
      if (q.category && q.category.id === selectedCategoryId) return true;
      const catObj = categoriesData.find((c) => c.id === selectedCategoryId);
      if (
        catObj &&
        (q.category?.name === catObj.name || q.category_name === catObj.name)
      ) {
        return true;
      }
      return false;
    });
    return filtered.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [questionsData, selectedCategoryId, categoriesData]);

  if (loading) {
    return (
      <div>
        <div className="flex flex-col gap-4">
          <div className="head bg-glass px-10 py-6 rounded-2xl shadow-sm flex items-center justify-between relative mt-16">
            <div className="content w-3/5 md:w-3/4">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="image absolute bottom-0 left-1 md:left-10 w-32 h-36">
              <div className="w-full h-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="formBaner relative rounded-2xl overflow-hidden h-48 bg-gray-200 animate-pulse"></div>
          <div className="flex flex-row flex-wrap gap-4">
            <div className="popular-questions bg-glass p-4 md:p-6 rounded-2xl shadow-sm flex-1 min-w-[280px]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-2 mb-6 overflow-hidden">
                <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-28 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white/60 dark:bg-zinc-800/60 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800"
                  >
                    <div className="w-full flex items-center justify-between">
                      <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="contact bg-glass p-4 rounded-2xl shadow-sm w-full md:w-1/3 h-fit">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-5"></div>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showFeedbackPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl text-orange-500">
              ⏳
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-800">شكرًا لتقييمك</h2>
            <p className="mb-5 text-gray-600">
              {feedbackMinutesRemaining > 0
                ? `يمكنك إعادة إرسال التقييم بعد ${feedbackMinutesRemaining} دقيقة.`
                : "يمكنك إرسال تقييم جديد الآن."}
            </p>
            <button
              type="button"
              onClick={() => setShowFeedbackPopup(false)}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-white transition-colors hover:bg-orange-600"
            >
              حسنًا
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="head bg-glass px-10 py-6 rounded-2xl shadow-sm flex items-center justify-between relative md:mt-16">
          <div className="content w-3/5 md:w-3/4">
            <h1 className="text-base md:text-2xl font-bold mb-4">
              هل تحتاج إلى مساعدة؟
            </h1>
            <p className="text-sm md:text-base text-[var(--text-secondary)]">
              إذا كان لديك أي استفسار أو واجهت مشكلة أثناء استخدام النظام، فريق
              الدعم لدينا جاهز لمساعدتك
            </p>
          </div>
          <div className="image absolute bottom-0 left-1 md:left-10 w-32 h-36">
            <Image
              src={support}
              alt="support"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="formBaner relative rounded-2xl overflow-hidden">
          <div className="imageBG h-full">
            <Image
              src={formBanner}
              alt="support"
              className="w-full h-full object-contain hidden lg:block"
            />
            <Image
              src={formBannerRes}
              alt="support"
              className="w-full h-full object-contain block lg:hidden"
            />
          </div>

          <div className="containt absolute top-1/2 right-0 transform -translate-y-1/2 mx-10 flex flex-col items-start xl:gap-4 lg:gap-2 gap-[4px]">
            <h1 className="text-base md:text-2xl font-bold text-white">
              قيّـــم تجــربتك معنـــا
            </h1>
            <p className="text-sm md:text-xl text-white font-normal ">
              هل استخدمت خدمتنا؟ رأيك يساعدنا نحسّن خدماتنا ونقدم تجربة أفضل.
            </p>
            <div className="flex items-center gap-2 text-white text-xs md:text-sm ">
              <FiClock />
              <p>لن يستغرق التقييم أكثر من 30 ثانية</p>
            </div>
            {hasSubmitted ? (
              <Button
                className="mt-4 !bg-white !text-black w-fit"
                icon={<FaStar size={20} color="#FFB900" />}
                onClick={handleSubmittedFeedbackClick}
              >
                شكرا لتقيمك
              </Button>
            ) : (
              <Button
                className="mt-4 !bg-white !text-black w-fit"
                url="/form"
                icon={<FaStar size={20} color="#FFB900" />}
              >
                قيم الخدمة الان
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Row: FAQ + Contact */}
        <div className="flex flex-col lg:flex-row flex-wrap gap-4">
          {/* FAQ Accordion */}
          <div className="popular-questions bg-glass p-4 md:p-6 rounded-2xl shadow-sm flex-1 min-w-[280px]">
            <div className="flex items-center gap-3 mb-5">
              <Image src={faq} alt="faq" className="w-6 h-6" />
              <h2 className="text-base md:text-2xl font-bold">
                الأسئلة الشائعة
              </h2>
            </div>

            {/* Category Pills */}
            {categoriesData.length > 0 && (
              <div
                className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none"
                style={{ scrollbarWidth: "none" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId("all");
                    setOpenId(null);
                  }}
                  className={`shrink-0 px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    selectedCategoryId === "all"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                      : "bg-white/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:bg-orange-50 dark:hover:bg-zinc-700 hover:text-orange-600 dark:hover:text-orange-400"
                  }`}
                >
                  الكل
                </button>
                {categoriesData.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(isSelected ? "all" : cat.id);
                        setOpenId(null);
                      }}
                      className={`shrink-0 px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                          : "bg-white/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:bg-orange-50 dark:hover:bg-zinc-700 hover:text-orange-600 dark:hover:text-orange-400"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Questions Accordion */}
            <div className="flex flex-col gap-3">
              {filteredQuestions.length === 0 ? (
                <div className="bg-glass rounded-2xl p-8 text-center border border-dashed border-gray-200 dark:border-zinc-700/60">
                  <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                    لا توجد أسئلة متاحة حالياً
                  </p>
                </div>
              ) : (
                filteredQuestions.map((item) => {
                  const isOpen = openId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`transition-all duration-300 ease-in-out overflow-hidden rounded-2xl border ${
                        isOpen
                          ? "bg-[#0E132C0C] dark:bg-zinc-800/90 border-gray-200/90 dark:border-zinc-700 shadow-sm"
                          : "bg-white/80 dark:bg-zinc-800/80 border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 shadow-sm"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestion(item.id)}
                        className="w-full flex items-center justify-between p-4 md:p-5 text-right outline-none cursor-pointer select-none transition-colors"
                      >
                        <span
                          className={`text-sm md:text-base transition-colors ${
                            isOpen
                              ? "font-bold text-gray-900 dark:text-white"
                              : "font-semibold text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {item.question}
                        </span>
                        <FiChevronDown
                          className={`size-4 md:size-5 shrink-0 transition-transform duration-300 text-gray-400 dark:text-gray-400 ms-3 ${
                            isOpen
                              ? "rotate-180 text-gray-700 dark:text-gray-200"
                              : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="px-4 md:px-5 pb-5 pt-1">
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal whitespace-pre-line">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div className="contact bg-glass p-4 rounded-2xl shadow-sm w-full lg:w-1/3 h-fit">
            <h2 className="text-base md:text-xl font-bold mb-5">
              تواصل معنا عن طريق:
            </h2>
            {socialLinksData.length === 0 ? (
              <p className="text-sm text-gray-500">
                لا توجد قنوات تواصل متاحة حالياً
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {socialLinksData.map((link) => {
                  const isExternal =
                    !link.value.startsWith("mailto:") &&
                    !link.value.startsWith("tel:") &&
                    link.value !== "#";
                  return (
                    <a
                      key={link.id}
                      href={link.value}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      title={`${link.name}${link.rawValue ? ` (${link.rawValue})` : ""}`}
                      className="flex items-center gap-3 !size-10 rounded-full justify-center demoBtn p-0 transition-all duration-200 hover:scale-[1.08]"
                    >
                      {renderSocialIcon(link)}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
