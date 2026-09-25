// lib/api/home.ts
import { apiClient } from "./config";

export interface IHomeHeader {
  badge: string;
  title: string;
  subtitle: string;
}

export interface ITimelineItem {
  number: number;
  title: string;
}

export interface IStepButton {
  text: string;
  url: string;
}

export interface IStepItem {
  step_number: number;
  title: string;
  subtitle: string;
  points: string[];
  button: IStepButton;
  image_url: string;
}

export interface IHomeData {
  header: IHomeHeader;
  timeline: ITimelineItem[];
  steps: IStepItem[];
}

export interface IHomeResponse {
  status: boolean;
  message: string;
  data: IHomeData;
}

// البيانات الاحتياطية الافتراضية في حال تعذر الوصول للـ API
export const DEFAULT_HOME_DATA: IHomeData = {
  header: {
    badge: "مرحباً بك في لوحة التحكم الخاصة بك",
    title: "خلّينــا نبــدأ خطــوة بخطـوة",
    subtitle:
      "هتساعدك لوحة التحكم دي إنك تجهز ثيم متجرك على سلة خطوة بخطوة. خُد وقتك وإحنا معاك في كل خطوة",
  },
  timeline: [
    { number: 1, title: "إنشاء حساب" },
    { number: 2, title: "اختيار الثيم" },
    { number: 3, title: "الشراء" },
    { number: 4, title: "التطبيق" },
    { number: 5, title: "التخصيص" },
  ],
  steps: [
    {
      step_number: 1,
      title: "كيفية إنشاء حساب على سلة",
      subtitle: "أول خطوة لبناء متجر إلكتروني مميز",
      points: [
        "ادخل على موقع سلة واضغط على «إنشاء متجر»",
        "سجل بريدك الإلكتروني وأنشئ كلمة مرور آمنة",
        "فعّل حسابك عن طريق تأكيد البريد الإلكتروني",
        "كمّل بيانات متجرك الأساسية",
      ],
      button: {
        text: "أنشئ حساب الآن",
        url: "https://salla.sa",
      },
      image_url:
        "https://eu2.contabostorage.com/504d848e8abb48e2a3bb8a8268486b33:themify-dashboard/steps/image1.png",
    },
    {
      step_number: 2,
      title: "كيفية اختيار الثيم المناسب",
      subtitle: "اختر الثيم اللي يعكس علامتك التجارية ومنتجاتك",
      points: [
        "تناسق مع منتجاتك: كل نوع منتجات له ثيمات تناسبه أكثر",
        "أسلوب علامتك التجارية: فكّر في الألوان، الخطوط، والشكل العام",
        "الخصائص اللي محتاجها: زي معرض المنتجات، الفلاتر، العرض السريع",
        "تجربة الموبايل: كل ثيماتنا متوافقة مع الموبايل",
      ],
      button: {
        text: "تصفح الثيمات",
        url: "/themes",
      },
      image_url:
        "https://eu2.contabostorage.com/504d848e8abb48e2a3bb8a8268486b33:themify-dashboard/steps/image2.png",
    },
  ],
};

/**
 * جلب بيانات الصفحة الرئيسية من الباك إند الجديد
 */
export async function fetchHomeData(): Promise<IHomeData> {
  try {
    const res = await apiClient<IHomeData>("/", {
      cache: "no-store", // جلب فوري ومحدث دائماً
    });

    if (res.success && res.data && res.data.header) {
      return res.data;
    }

    console.warn("⚠️ لم يتم استلام بيانات الهوم بنجاح، استخدام البيانات الافتراضية:", res.error);
    return DEFAULT_HOME_DATA;
  } catch (error) {
    console.error("❌ خطأ أثناء جلب بيانات الصفحة الرئيسية:", error);
    return DEFAULT_HOME_DATA;
  }
}
