// features/feedback/data.ts

export const FEEDBACK_STATUS_OPTIONS = [
  "الكل",
  "جديد",
  "تم المراجعة",
  "تم التواصل",
] as const;

export type FilterStatus = (typeof FEEDBACK_STATUS_OPTIONS)[number];

export const FEEDBACK_RATING_OPTIONS = [
  "الكل",
  "ممتاز",
  "جيد جدًا",
  "جيد",
  "مقبول",
  "غير راضٍ",
] as const;

export type FilterRating = (typeof FEEDBACK_RATING_OPTIONS)[number];

export const FEEDBACK_PROFESSION_OPTIONS = [
  "الكل",
  "مبرمج",
  "مصمم",
  "صاحب المتجر",
  "تاجر",
  "مسوق",
  "صانع محتوى",
  "ميدياباير",
  "SEO",
  "أخرى",
] as const;

export type FilterProfession = (typeof FEEDBACK_PROFESSION_OPTIONS)[number];

export const getFeedbackStatusColor = (status: string): string => {
  switch (status) {
    case "جديد":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "تم المراجعة":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "تم التواصل":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getFeedbackRatingColor = (rating: string): string => {
  switch (rating) {
    case "ممتاز":
      return "text-green-600";
    case "جيد جدًا":
      return "text-blue-600";
    case "جيد":
      return "text-yellow-600";
    case "مقبول":
      return "text-orange-600";
    case "غير راضٍ":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export const FEEDBACK_EXCEL_COL_WIDTHS = [
  { wch: 12 }, // التاريخ
  { wch: 20 }, // الاسم
  { wch: 15 }, // رقم الموبايل
  { wch: 25 }, // البريد الإلكتروني
  { wch: 30 }, // لينك المتجر
  { wch: 15 }, // المهنة
  { wch: 12 }, // التقييم
  { wch: 40 }, // التعليق
  { wch: 10 }, // التوصية
  { wch: 12 }, // الحالة
  { wch: 10 }, // واجه صعوبة
  { wch: 40 }, // تفاصيل الصعوبة
  { wch: 40 }, // اقتراحات التحسين
  { wch: 40 }, // ملاحظات المسؤول
  { wch: 12 }, // تاريخ التحديث
];
