"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/useUserData";
import { toast } from "sonner";
import { submitFeedback, IFeedbackPayload } from "@/lib/api/feedbacks";
import {
  FaStar,
  FaHeart,
  FaPhone,
  FaUser,
  FaEnvelope,
  FaExclamationCircle,
  FaStore,
  FaHome,
  FaChevronDown,
} from "react-icons/fa";

import Image from "next/image";
import happy from "@/public/feedback/happy.png";
import smile from "@/public/feedback/smil.png";
import unhappy from "@/public/feedback/unhappy.png";
import mad from "@/public/feedback/mad.png";
import veryGood from "@/public/feedback/veryGood.png";
import { CiHeart } from "react-icons/ci";

// ─── Country Codes ────────────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: "+966", label: "🇸🇦 +966", country: "السعودية" },
  { code: "+20", label: "🇪🇬 +20", country: "مصر" },
  { code: "+971", label: "🇦🇪 +971", country: "الإمارات" },
  { code: "+965", label: "🇰🇼 +965", country: "الكويت" },
  { code: "+974", label: "🇶🇦 +974", country: "قطر" },
  { code: "+973", label: "🇧🇭 +973", country: "البحرين" },
  { code: "+968", label: "🇴🇲 +968", country: "عُمان" },
  { code: "+962", label: "🇯🇴 +962", country: "الأردن" },
  { code: "+961", label: "🇱🇧 +961", country: "لبنان" },
  { code: "+963", label: "🇸🇾 +963", country: "سوريا" },
  { code: "+964", label: "🇮🇶 +964", country: "العراق" },
  { code: "+212", label: "🇲🇦 +212", country: "المغرب" },
  { code: "+216", label: "🇹🇳 +216", country: "تونس" },
  { code: "+213", label: "🇩🇿 +213", country: "الجزائر" },
];

// ─── Types ───────────────────────────────────────────────────────────────────
type Rating = "ممتاز" | "جيد جدًا" | "جيد" | "مقبول" | "غير راضٍ" | "";
type YesNo = "نعم" | "لا" | "";
type Recommendation = "نعم" | "ربما" | "لا" | "";
type Relation = "مبرمج" | "مصمم" | "صاحب المتجر" | "ميدياباير" | "SEO" | "اخري" | "";

interface FormData {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  storeLink: string;
  overallRating: Rating;
  experienceFeedback: string;
  hadDifficulty: YesNo;
  difficultyDetails: string;
  suggestions: string;
  wouldRecommend: Recommendation;
  relation: Relation;
  relationOther: string;
}

const RATING_TO_NUMBER: Record<string, number> = {
  "ممتاز": 5,
  "جيد جدًا": 4,
  "جيد جدا": 4,
  "جيد": 3,
  "مقبول": 2,
  "غير راضٍ": 1,
  "غير راض": 1,
  "غير راضي": 1,
  "سيء": 1,
  "سيئ": 1,
};

const RECOMMENDATION_MAP: Record<string, string> = {
  "نعم": "yes",
  "ربما": "maybe",
  "لا": "no",
};

const initialForm: FormData = {
  name: "",
  email: "",
  countryCode: "+966",
  phone: "",
  storeLink: "",
  overallRating: "",
  experienceFeedback: "",
  hadDifficulty: "",
  difficultyDetails: "",
  suggestions: "",
  wouldRecommend: "",
  relation: "",
  relationOther: "",
};

// ─── Shared Styles ───────────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 text-gray-800 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 placeholder:text-gray-400 hover:border-gray-200";

const textareaClass =
  "w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 text-gray-800 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 resize-none placeholder:text-gray-400 hover:border-gray-200 min-h-[100px]";

// ─── Radio Group Helper ────────────────────────────────────────────────
const RadioGroup = ({
  name,
  options,
  value,
  onChange,
  icons,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  icons?: { [key: string]: React.ReactNode };
}) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
    {options.map((option) => {
      const selected = value === option;
      return (
        <label
          key={option}
          onClick={() => onChange(option)}
          className={`
            relative flex flex-col items-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 select-none
            ${selected
              ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100/50 shadow-md ring-2 ring-orange-500/20"
              : "border-gray-100 bg-gray-50/50 hover:border-orange-200 hover:bg-orange-50/30"
            }
          `}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={selected}
            onChange={() => onChange(option)}
            className="sr-only"
          />
          {icons?.[option] && (
            <span
              className={`text-2xl w-12 h-12 flex items-center justify-center transition-transform ${selected ? "scale-110 text-orange-500" : "text-gray-400 opacity-80"}`}
            >
              {icons[option]}
            </span>
          )}
          <span
            className={`text-sm font-medium ${selected ? "text-orange-600 font-bold" : "text-gray-600"}`}
          >
            {option}
          </span>
          {selected && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg font-bold">
              ✓
            </span>
          )}
        </label>
      );
    })}
  </div>
);

// ─── Field Wrapper ─────────────────────────────────────────────────────
const FieldWrapper = ({
  label,
  required,
  icon,
  children,
  error,
  fullWidth = false,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  error?: string;
  fullWidth?: boolean;
}) => (
  <div className={`flex flex-col gap-2 ${fullWidth ? "md:col-span-2" : ""}`}>
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
    </div>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
        <FaExclamationCircle className="text-xs" />
        {error}
      </p>
    )}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
const COOLDOWN_KEY = "feedback_submitted_at";
const COOLDOWN_MINUTES = 10;

const FeedbackFormPage = () => {
  const { userEmail } = useUserData();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDifficultyField, setShowDifficultyField] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isChecking, setIsChecking] = useState(true);
  const [showCooldownPopup, setShowCooldownPopup] = useState(false);

  // Auto populate email if user is logged in
  useEffect(() => {
    if (userEmail && !form.email) {
      setForm((prev) => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

  // ─── Check localStorage cooldown on mount ───────────────────────────────
  useEffect(() => {
    const check = () => {
      const ts = localStorage.getItem(COOLDOWN_KEY);
      if (ts) {
        const elapsed = Date.now() - parseInt(ts, 10);
        const remaining = COOLDOWN_MINUTES * 60 * 1000 - elapsed;
        if (remaining > 0) {
          setCooldownRemaining(Math.ceil(remaining / 60000));
          setIsChecking(false);
          return;
        }
        localStorage.removeItem(COOLDOWN_KEY);
      }
      setCooldownRemaining(0);
      setIsChecking(false);
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const updateField = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }

    if (key === "hadDifficulty") {
      setShowDifficultyField(value === "نعم");
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.name.trim()) newErrors.name = "الاسم مطلوب";

    // Phone: must have digits
    if (!form.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب";
    } else {
      const digits = form.phone.replace(/\D/g, "");
      if (digits.length < 6) {
        newErrors.phone = "رقم الهاتف يجب أن يكون 6 أرقام على الأقل";
      }
    }

    if (!form.storeLink.trim()) {
      newErrors.storeLink = "رابط المتجر مطلوب";
    }

    if (!form.overallRating) newErrors.overallRating = "يرجى اختيار تقييم";
    if (!form.hadDifficulty) newErrors.hadDifficulty = "يرجى الإجابة على هذا السؤال";
    if (!form.wouldRecommend) newErrors.wouldRecommend = "يرجى الإجابة على هذا السؤال";
    if (!form.relation) newErrors.relation = "يرجى تحديد علاقتك بالمتجر";
    if (form.relation === "اخري" && !form.relationOther.trim()) {
      newErrors.relationOther = "يرجى كتابة تفاصيل علاقتك";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const submittedAt = localStorage.getItem(COOLDOWN_KEY);
    const remaining = submittedAt
      ? COOLDOWN_MINUTES * 60 * 1000 - (Date.now() - parseInt(submittedAt, 10))
      : 0;

    if (remaining > 0) {
      setCooldownRemaining(Math.ceil(remaining / 60000));
      setShowCooldownPopup(true);
      return;
    }

    setSubmitting(true);

    try {
      const profession =
        form.relation === "اخري" ? form.relationOther.trim() : (form.relation as string);

      const ratingNumber = RATING_TO_NUMBER[form.overallRating] || 5;
      const recommendationValue = RECOMMENDATION_MAP[form.wouldRecommend] || "yes";

      const payload: IFeedbackPayload = {
        full_name: form.name.trim(),
        phone_number: `${form.countryCode}${form.phone.trim()}`,
        email: form.email.trim() || userEmail || "",
        store_link: form.storeLink.trim(),
        profession,
        rating: ratingNumber,
        experience_feedback: form.experienceFeedback.trim(),
        had_difficulty: form.hadDifficulty === "نعم",
        difficulty_details: form.hadDifficulty === "نعم" && form.difficultyDetails.trim() ? form.difficultyDetails.trim() : null,
        improvements_suggestions: form.suggestions.trim(),
        recommendation: recommendationValue,
        page_url: typeof window !== "undefined" ? window.location.href : "https://themiify.com/form",
      };

      // Submit to /feedbacks API
      const result = await submitFeedback(payload);
      if (!result?.success) {
        throw new Error(result?.error || result?.message || "فشل في إرسال التقييم");
      }

      // Save submission timestamp to localStorage
      localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
      router.push("/support");
    } catch (error: any) {
      toast.error("❌ فشل الإرسال: " + (error?.message || "حدث خطأ"), {
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Access Control ────────────────────────────────────────────────────
  if (isChecking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  // ─── Main Form ─────────────────────────────────────────────────────────
  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-y-auto bg-glass md:py-8 md:px-4 p-2"
    >
      {showCooldownPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
              ✓
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-800">شكرًا لتقييمك</h2>
            <p className="mb-5 text-gray-600">
              يمكنك إعادة إرسال التقييم بعد {cooldownRemaining} دقيقة.
            </p>
            <button
              type="button"
              onClick={() => setShowCooldownPopup(false)}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-white transition-colors hover:bg-orange-600"
            >
              حسنًا
            </button>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center relative overflow-hidden rounded-2xl bg-white text-black p-8 mb-2">
          <div className="relative z-10 mb-4">
            <h1 className="text-3xl font-bold mb-3 flex items-center gap-2 justify-center">
              <span>نسعد برأيك وتجربتك معنا</span>
              <CiHeart className="text-4xl text-red-500 hidden" />
              <FaHeart className="text-2xl text-red-500 hidden" />
            </h1>
            <p className="max-w-md mx-auto text-lg leading-relaxed text-gray-600">
              نرجو منك تعبئة هذا النموذج السريع، لنستطيع تحسين خدماتنا وتقديم
              تجربة أفضل لك.
            </p>
          </div>
          {/* روابط التصفح */}
          <div className="flex justify-center flex-wrap gap-4">
            <a
              href="/"
              className="px-4 md:px-6 py-2 text-nowrap bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-gray-200"
            >
              <FaHome className="text-sm" />
              الرئيسية
            </a>
            <a
              href="/themes"
              className="px-4 md:px-6 py-2 text-nowrap bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-gray-200"
            >
              <FaStore className="text-sm" />
              تصفح الثيمات
            </a>
            <a
              href="/essays"
              className="px-4 md:px-6 py-2 text-nowrap bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-gray-200"
            >
              <FaHeart className="text-sm" />
              قراءة المقالات
            </a>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {/* Section 1: User Info */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FaUser />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                بيانات المستخدم
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <FieldWrapper
                label="الاسم"
                required
                icon={<FaUser />}
                error={errors.name}
              >
                <input
                  type="text"
                  placeholder="أدخل اسمك"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={inputClass}
                  maxLength={100}
                />
              </FieldWrapper>

              {/* Email */}
              <FieldWrapper
                label="البريد الإلكتروني"
                icon={<FaEnvelope />}
                error={errors.email}
              >
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={inputClass}
                  dir="ltr"
                />
              </FieldWrapper>

              {/* Phone with country code dropdown */}
              <FieldWrapper
                label="رقم الهاتف"
                icon={<FaPhone />}
                required
                error={errors.phone}
              >
                <div className="flex gap-2 appearance-none rounded-xl border-2 border-gray-100 bg-gray-50/50 text-gray-800 pr-3 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 hover:border-gray-200 overflow-hidden" dir="ltr">
                  {/* Country Code Dropdown */}
                  <div className="relative w-fit">
                    <select
                      value={form.countryCode}
                      onChange={(e) => updateField("countryCode", e.target.value)}
                      className="w-fit py-3 bg-transparent cursor-pointer !rounded-none outline-none"
                    >
                      {COUNTRY_CODES.map(({ code, label, country }) => (
                        <option key={code} value={code} title={country}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>

                  {/* Phone number input */}
                  <input
                    type="tel"
                    placeholder="123456789"
                    value={form.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      updateField("phone", val);
                    }}
                    required
                    className="flex-1 bg-transparent border-none outline-none py-3"
                    dir="ltr"
                  />
                </div>
              </FieldWrapper>

              {/* Store Link */}
              <FieldWrapper
                label="رابط المتجر"
                required
                icon={<FaStore />}
                error={errors.storeLink}
              >
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={form.storeLink}
                  onChange={(e) => updateField("storeLink", e.target.value)}
                  className={inputClass}
                  maxLength={500}
                  dir="ltr"
                />
                <p className="text-[11px] text-gray-400 mt-1">أدخل الرابط الكامل لمتجرك (يبدأ بـ https://)</p>
              </FieldWrapper>
            </div>
          </div>

          {/* Section 2: Experience Rating */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FaStar />
              </div>
              <h2 className="text-xl font-bold text-gray-800">تقييم التجربة</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Overall Rating */}
              <FieldWrapper
                label="كيف تقيم تجربتك معنا بشكل عام؟"
                required
                error={errors.overallRating}
                fullWidth
              >
                <RadioGroup
                  name="overallRating"
                  options={["ممتاز", "جيد جدًا", "جيد", "مقبول", "غير راضٍ"]}
                  value={form.overallRating}
                  onChange={(v) => updateField("overallRating", v as Rating)}
                  icons={{
                    ممتاز: <Image src={happy} alt="" width={50} height={50} />,
                    "جيد جدًا": <Image src={veryGood} alt="" width={45} height={45} />,
                    جيد: <Image src={smile} alt="" width={36} height={36} />,
                    مقبول: <Image src={unhappy} alt="" width={36} height={36} />,
                    "غير راضٍ": <Image src={mad} alt="" width={36} height={36} />,
                  }}
                />
              </FieldWrapper>

              {/* Experience text */}
              <FieldWrapper label="كيف كانت تجربتك معنا؟" fullWidth>
                <textarea
                  placeholder="شاركنا رأيك..."
                  value={form.experienceFeedback}
                  onChange={(e) =>
                    updateField("experienceFeedback", e.target.value)
                  }
                  className={textareaClass}
                  maxLength={1000}
                />
              </FieldWrapper>

              {/* Had difficulty */}
              <FieldWrapper
                label="هل واجهت أي صعوبة؟"
                required
                error={errors.hadDifficulty}
                fullWidth
              >
                <RadioGroup
                  name="hadDifficulty"
                  options={["نعم", "لا"]}
                  value={form.hadDifficulty}
                  onChange={(v) => updateField("hadDifficulty", v as YesNo)}
                />
              </FieldWrapper>

              {/* Conditional: difficulty details */}
              {showDifficultyField && (
                <FieldWrapper label="يرجى توضيح الصعوبة" fullWidth>
                  <textarea
                    placeholder="اشرح لنا المشكلة..."
                    value={form.difficultyDetails}
                    onChange={(e) =>
                      updateField("difficultyDetails", e.target.value)
                    }
                    className={textareaClass}
                    maxLength={1000}
                  />
                </FieldWrapper>
              )}

              {/* Suggestions */}
              <FieldWrapper label="اقتراحاتك للتحسين" fullWidth>
                <textarea
                  placeholder="اكتب اقتراحاتك هنا..."
                  value={form.suggestions}
                  onChange={(e) => updateField("suggestions", e.target.value)}
                  className={textareaClass}
                  maxLength={1000}
                />
              </FieldWrapper>

              {/* Would recommend */}
              <FieldWrapper
                label="هل تنصح بالتعامل معنا؟"
                required
                error={errors.wouldRecommend}
                fullWidth
              >
                <RadioGroup
                  name="wouldRecommend"
                  options={["نعم", "ربما", "لا"]}
                  value={form.wouldRecommend}
                  onChange={(v) =>
                    updateField("wouldRecommend", v as Recommendation)
                  }
                />
              </FieldWrapper>

              {/* Relation */}
              <FieldWrapper
                label="ما علاقتك بالمتجر؟"
                required
                error={errors.relation}
                fullWidth
              >
                <RadioGroup
                  name="relation"
                  options={["مبرمج", "مصمم", "صاحب المتجر", "ميدياباير", "SEO", "اخري"]}
                  value={form.relation}
                  onChange={(v) => updateField("relation", v as Relation)}
                />
              </FieldWrapper>

              {/* Conditional: relation other */}
              {form.relation === "اخري" && (
                <FieldWrapper
                  label="يرجى تحديد علاقتك"
                  required
                  error={errors.relationOther}
                  fullWidth
                >
                  <input
                    type="text"
                    placeholder="اكتب علاقتك بالمتجر..."
                    value={form.relationOther}
                    onChange={(e) => updateField("relationOther", e.target.value)}
                    className={inputClass}
                  />
                </FieldWrapper>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-gradient-to-l from-orange-500 to-orange-600 text-white font-bold text-lg
              hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl
              relative overflow-hidden group cursor-pointer"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <span>إرسال التقييم</span>
                <FaStar className="text-xl animate-spin-slow" />
              </>
            )}
          </button>

          {/* Footer Note */}
          <p className="text-center text-sm text-gray-500 mt-4">
            بياناتك محفوظة بسرية تامة ويتم التعامل معها وفق أنظمة حماية البيانات في المملكة العربية السعودية لضمان خصوصيتك وأمان معلوماتك..
          </p>
        </form>
      </div>
    </div>
  );
};

export default FeedbackFormPage;
