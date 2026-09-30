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

  const availableStepsCount = steps ? steps.length : 0;

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

          {/* Timeline Bar (الـ Stepper مطابق للتصميم ويبدأ من بداية الصفحة) */}
          {timeline && timeline.length > 0 && (
            <div className="mb-8 md:mb-14 w-full py-2">
              <div className="max-w-4xl">
                <div className="relative flex items-center justify-between">
                  {/* الخط الرمادي المجوف الواصل بين مراكز الدوائر بنفس تأثير التصميم */}
                  <div
                    className="step-track-line absolute z-0 top-[22px] sm:top-[28px] md:top-[29px] -translate-y-1/2"
                    style={{
                      right: `${100 / (timeline.length * 2)}%`,
                      left: `${100 / (timeline.length * 2)}%`,
                    }}
                  />

                  {timeline.map((item) => (
                    <a
                      key={item.number}
                      href={`#step-${item.number}`}
                      className="flex-1 flex flex-col items-center relative z-10 text-center px-0.5 sm:px-1 cursor-pointer group no-underline"
                    >
                      {/* دائرة الرقم بتأثير البوكس شادو الداخلي بحجم أكبر وواضح */}
                      <div className="step-circle flex h-11 w-11 sm:h-14 sm:w-14 md:h-[58px] md:w-[58px] items-center justify-center rounded-full text-sm sm:text-base md:text-xl font-extrabold select-none transition-all duration-300 group-hover:scale-105">
                        {item.number}
                      </div>

                      {/* عنوان الخطوة */}
                      <span className="mt-2.5 sm:mt-3 md:mt-3.5 text-[11px] sm:text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 text-center leading-tight group-hover:text-[var(--primary-color)] transition-colors">
                        {item.title}
                      </span>
                    </a>
                  ))}
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
                    id={`step-${step.step_number}`}
                    className="scroll-mt-24 flex flex-col-reverse items-center gap-4 overflow-hidden rounded-2xl bg-glass p-4 transition-all duration-300 hover:shadow-lg md:flex-row md:gap-6 md:p-6"
                  >
                    {/* المحتوى النصي */}
                    <div className="section-content flex w-full items-start gap-3 md:w-1/2">
                      <div className="mt-1 number w-8 md:w-12 h-8 md:h-12 rounded-full text-[var(--primary-color)] text-base md:text-2xl font-bold shadow-[1px_-1px_#fff,0_1px_#f26b21] flex items-center justify-center shrink-0">
                        {step.step_number}
                      </div>

                      <div className="content w-[calc(100%-3rem)] py-1">
                        <h2 className="mb-2 text-base font-bold !text-black dark:text-white md:text-2xl">
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
                                    {step.step_number === 1 ? (
                                       <Image
                                        src={checkmarkCircle}
                                        alt="check"
                                        className="w-full h-full object-contain"
                                      />
                                    ) : (
                                     <svg
                                        width="8"
                                        height="8"
                                        viewBox="0 0 8 8"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                      >
                                        <g filter={`url(#filter0_i_${step.step_number}_${pIdx})`}>
                                          <circle cx="4" cy="4" r="4" fill="#F26B21" />
                                        </g>
                                        <defs>
                                          <filter
                                            id={`filter0_i_${step.step_number}_${pIdx}`}
                                            x="0"
                                            y="0"
                                            width="8"
                                            height="10.4615"
                                            filterUnits="userSpaceOnUse"
                                            colorInterpolationFilters="sRGB"
                                          >
                                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                            <feColorMatrix
                                              in="SourceAlpha"
                                              type="matrix"
                                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                              result="hardAlpha"
                                            />
                                            <feOffset dy="2.46154" />
                                            <feGaussianBlur stdDeviation="1.23077" />
                                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                            <feColorMatrix
                                              type="matrix"
                                              values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
                                            />
                                            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_145_183" />
                                          </filter>
                                        </defs>
                                      </svg>
                                    )}
                                  </span>
                                  <span className="font-medium text-black/80 dark:text-white text-xs md:text-base leading-relaxed">
                                    {hasColon ? (
                                      <>
                                        <strong className="text-black font-bold ml-1">
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
