// app/(client)/page.tsx
import Image from "next/image";
import { BsStars } from "react-icons/bs";
import checkmarkCircle from "@/public/images/checkmark-circle.svg";
import sallaImage from "@/public/images/salla.png";
import themesImage from "@/public/images/themes.png";
import Button from "@/components/ui/Button";
import { fetchHomeData, IHomeData, IStepItem } from "@/lib/api/home";

// صور احتياطية حسب رقم الخطوة
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fallbackImages: Record<number, any> = {
  1: sallaImage,
  2: themesImage,
};

export default async function ClientDashboardPage() {
  const homeData: IHomeData = await fetchHomeData();
  const { header, timeline, steps } = homeData;

  return (
    <main className="pb-10">
      <div dir="rtl" className="h-full pb-10">
        <div className="w-11/12 mx-auto px-4 md:py-6 py-5">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <BsStars className="text-[#FFCC00] rotate-180" size={20} />
              <h1
                className="text-[12px] md:text-sm font-bold mb-2"
                style={{ color: "var(--primary-color)" }}
              >
                {header?.badge || "مرحبًا بك في لوحة التحكم"}
              </h1>
            </div>
            <p className="md:text-3xl text-xl font-bold text-black dark:text-white mb-2">
              {header?.title || "لنبدأ باختيار الثيم الأنسب لمتجرك"}
            </p>
            <p className="text-black dark:text-white text-base md:text-lg font-normal max-w-3xl leading-relaxed">
              {header?.subtitle ||
                "ستجد هنا خطوات واضحة تساعدك على اختيار وتخصيص الثيم ومتابعة تقدمك حتى يصبح متجرك جاهزًا."}
            </p>
          </div>

          {/* Timeline Bar (الـ Stepper مطابق للتصميم المرفق) */}
          {timeline && timeline.length > 0 && (
            <div className="mb-14 p-4 md:p-8 bg-glass rounded-3xl overflow-x-auto shadow-sm border border-white/60">
              <div className="min-w-[580px] md:min-w-0">
                {/* الوصف أعلى الـ Stepper كما في التصميم */}
                <p className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium mb-10 leading-relaxed max-w-2xl mx-auto">
                  هتساعدك لوحة التحكم دي إنك تجهّز ثيم متجرك على سلة خطوة بخطوة. خُد وقتك وإحنا معاك في كل خطوة
                </p>

                {/* شريط الخطوات المتصل */}
                <div className="relative flex items-center justify-between px-4 md:px-10">
                  {/* خط الربط المستمر خلف الدوائر من أول خطوة لآخر خطوة */}
                  <div className="absolute top-6 md:top-7 right-[10%] left-[10%] h-[2px] bg-[#E2E8F0] dark:bg-gray-700 -z-0" />

                  {timeline.map((item) => (
                    <div
                      key={item.number}
                      className="flex-1 flex flex-col items-center relative z-10 text-center"
                    >
                      {/* دائرة الرقم البيضاء المظللة */}
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white dark:bg-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-gray-700 flex items-center justify-center font-bold text-lg md:text-xl text-[#0E132C] dark:text-white transition-all duration-300 hover:scale-105">
                        {item.number}
                      </div>

                      {/* عنوان الخطوة */}
                      <span className="mt-3 md:mt-4 text-xs md:text-sm font-bold text-[#1F2937] dark:text-gray-200">
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* أقسام الخطوات (Steps) */}
          <div className="space-y-6">
            {steps && steps.length > 0 ? (
              steps.map((step: IStepItem) => {
                const fallbackImg = fallbackImages[step.step_number] || sallaImage;

                return (
                  <div
                    key={step.step_number}
                    className="rounded-2xl overflow-hidden flex p-4 md:p-6 bg-glass flex-col-reverse md:flex-row items-center gap-6 transition-all duration-300 hover:shadow-lg"
                  >
                    {/* المحتوى النصي */}
                    <div className="section-content flex items-start gap-3 w-full md:w-1/2">
                      <div className="mt-1 number w-8 md:w-12 h-8 md:h-12 rounded-full text-[var(--primary-color)] text-base md:text-2xl font-bold shadow-[1px_-1px_#fff,0_1px_#f26b21] flex items-center justify-center shrink-0">
                        {step.step_number}
                      </div>

                      <div className="content py-1 w-[calc(100%-3rem)]">
                        <h2 className="text-base md:text-2xl font-bold text-black dark:text-white mb-2">
                          {step.title}
                        </h2>
                        {step.subtitle && (
                          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-base font-medium mb-4">
                            {step.subtitle}
                          </p>
                        )}

                        {/* قائمة النقاط */}
                        {step.points && step.points.length > 0 && (
                          <ul className="space-y-2.5 mb-6">
                            {step.points.map((point: string, pIdx: number) => {
                              // التحقق مما إذا كانت النقطة تحتوي على عنوان مفصول بنقطتين ":"
                              const hasColon = point.includes(":");
                              const titlePart = hasColon
                                ? point.substring(0, point.indexOf(":") + 1)
                                : "";
                              const descPart = hasColon
                                ? point.substring(point.indexOf(":") + 1)
                                : point;

                              return (
                                <li
                                  key={pIdx}
                                  className="flex items-start gap-2.5"
                                >
                                  <span className="flex items-center justify-center w-4 h-4 md:w-5 md:h-5 mt-1 shrink-0">
                                    <Image
                                      src={checkmarkCircle}
                                      alt="check"
                                      className="w-full h-full object-contain"
                                    />
                                  </span>
                                  <span className="font-medium text-black dark:text-white text-xs md:text-base leading-relaxed">
                                    {hasColon ? (
                                      <>
                                        <strong className="text-[var(--primary-color)] font-bold ml-1">
                                          {titlePart}
                                        </strong>
                                        {descPart}
                                      </>
                                    ) : (
                                      point
                                    )}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        {/* زر الإجراء */}
                        {step.button && (
                          <Button
                            url={step.button.url || "#"}
                            className="px-8 flex justify-center items-center min-w-[180px]"
                            openInNewTab={step.button.url?.startsWith("http")}
                          >
                            {step.button.text || "استمرار"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* صورة الخطوة */}
                    <div className="relative w-full md:w-1/2 flex items-center justify-center min-h-[220px] md:min-h-[280px]">
                      {step.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={step.image_url}
                          alt={step.title}
                          className="w-full max-h-[320px] object-contain rounded-xl drop-shadow-md"
                          loading="lazy"
                        />
                      ) : (
                        <Image
                          src={fallbackImg}
                          alt={step.title}
                          className="object-contain max-h-[320px] rounded-xl"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500 bg-glass rounded-2xl">
                لا توجد خطوات متاحة حالياً
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}