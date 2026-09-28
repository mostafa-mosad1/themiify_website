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

  const totalSteps = timeline?.length || 5;
  const availableStepsCount = steps ? steps.length : 0;
  // Progress line connects from step 1 through available steps to the next point
  const filledSegments = Math.min(availableStepsCount, totalSteps - 1);
  const totalTrackSpan = 100 - (100 / totalSteps);
  const progressWidthPercent =
    totalSteps > 1 ? (filledSegments / (totalSteps - 1)) * totalTrackSpan : 0;

  return (
    <main className="pb-10">
      <div dir="rtl" className="h-full pb-10">
        <div className="w-full px-3 py-5  md:py-6">
          {/* Header */}
          <div className="mb-6 md:mb-10">
            <div className="flex items-center gap-2 mb-2">
              <BsStars className="text-[#FFCC00] rotate-180" size={20} />
              <h1
                className="text-[12px] md:text-sm font-bold mb-2"
                style={{ color: "var(--primary-color)" }}
              >
                {header?.badge || "مرحبًا بك في لوحة التحكم"}
              </h1>
            </div>
            <p className="mb-2 text-xl font-bold text-black dark:text-white md:text-3xl">
              {header?.title || "لنبدأ باختيار الثيم الأنسب لمتجرك"}
            </p>
            <p className="max-w-3xl text-sm font-normal leading-relaxed text-black dark:text-white md:text-lg">
              {header?.subtitle ||
                "ستجد هنا خطوات واضحة تساعدك على اختيار وتخصيص الثيم ومتابعة تقدمك حتى يصبح متجرك جاهزًا."}
            </p>
          </div>

          {/* Timeline Bar (الـ Stepper مطابق للتصميم ومستجيب بالكامل) */}
          {timeline && timeline.length > 0 && (
            <div className="mb-8 md:mb-14 w-full py-2">
              <div className="w-full">
                {/* شريط الخطوات المتصل */}
                <div className="relative flex items-center justify-between">
                  {/* خط الربط الأساسي الرمادي العريض خلف الدوائر */}
                  <div
                    className="absolute z-0 h-[5px] md:h-[6px] rounded-full bg-[#e2e8f0] dark:bg-slate-700 top-[18px] sm:top-[22px] md:top-[27px] -translate-y-1/2 shadow-inner"
                    style={{
                      right: `${100 / (totalSteps * 2)}%`,
                      left: `${100 / (totalSteps * 2)}%`,
                    }}
                  />

                  {/* خط التقدم الممتلئ العريض بتدرج لوني برتقالي غني ومتناسق */}
                  {progressWidthPercent > 0 && (
                    <div
                      className="absolute z-0 h-[5px] md:h-[6px] rounded-full bg-gradient-to-l from-[#ea580c] via-[#f26a21] to-[#fb923c] top-[18px] sm:top-[22px] md:top-[27px] -translate-y-1/2 transition-all duration-700 ease-out shadow-[0_2px_8px_rgba(242,106,33,0.3)]"
                      style={{
                        right: `${100 / (totalSteps * 2)}%`,
                        width: `${progressWidthPercent}%`,
                      }}
                    />
                  )}

                  {timeline.map((item) => {
                    const isStepDone = item.number <= availableStepsCount;

                    return (
                      <div
                        key={item.number}
                        className="flex-1 flex flex-col items-center relative z-10 text-center px-0.5"
                      >
                        {/* دائرة الرقم بتأثير البوكس شادو الداخلي مطابق للصورة */}
                        <div
                          className="step-circle flex h-9 w-9 sm:h-11 sm:w-11 md:h-[54px] md:w-[54px] items-center justify-center rounded-full text-xs sm:text-sm md:text-lg font-extrabold select-none cursor-pointer transition-all duration-300"
                        >
                          {item.number}
                        </div>

                        {/* عنوان الخطوة */}
                        <span
                          className={`mt-1.5 sm:mt-2.5 md:mt-3.5 text-[9px] sm:text-xs md:text-sm font-bold text-center leading-tight transition-colors duration-300 ${
                            isStepDone
                              ? "text-[var(--primary-color)] dark:text-[var(--primary-color)]"
                              : "text-[#1f2937] dark:text-gray-200"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* أقسام الخطوات (Steps) */}
          <div className="space-y-6">
            {steps && steps.length > 0 ? (
              steps.map((step: IStepItem) => {
                const fallbackImg =
                  fallbackImages[step.step_number] || sallaImage;

                return (
                  <div
                    key={step.step_number}
                    className="flex flex-col-reverse items-center gap-4 overflow-hidden rounded-2xl bg-glass p-4 transition-all duration-300 hover:shadow-lg md:flex-row md:gap-6 md:p-6"
                  >
                    {/* المحتوى النصي */}
                    <div className="section-content flex w-full items-start gap-3 md:w-1/2">
                      <div className="mt-1 number w-8 md:w-12 h-8 md:h-12 rounded-full text-[var(--primary-color)] text-base md:text-2xl font-bold shadow-[1px_-1px_#fff,0_1px_#f26b21] flex items-center justify-center shrink-0">
                        {step.step_number}
                      </div>

                      <div className="content w-[calc(100%-3rem)] py-1">
                        <h2 className="mb-2 text-base font-bold text-black dark:text-white md:text-2xl">
                          {step.title}
                        </h2>
                        {step.subtitle && (
                          <p className="mb-4 text-xs font-medium text-gray-600 dark:text-gray-300 md:text-base">
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
                            className="flex w-full items-center justify-center px-8 md:min-w-[180px] md:w-auto"
                            openInNewTab={step.button.url?.startsWith("http")}
                          >
                            {step.button.text || "استمرار"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* صورة الخطوة */}
                    <div className="relative flex min-h-[180px] w-full items-center justify-center md:min-h-[280px] md:w-1/2">
                      {step.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={step.image_url}
                          alt={step.title}
                          className="w-full max-h-[220px] rounded-xl object-contain drop-shadow-md md:max-h-[320px]"
                          loading="lazy"
                        />
                      ) : (
                        <Image
                          src={fallbackImg}
                          alt={step.title}
                          className="max-h-[220px] rounded-xl object-contain md:max-h-[320px]"
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
