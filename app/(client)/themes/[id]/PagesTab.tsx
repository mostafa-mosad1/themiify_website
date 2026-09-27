"use client";
import { MutableRefObject, useEffect, useState, useRef } from "react";
import Button from "@/components/ui/Button";
import PagesDropdown from "./PagesDropdown";

/** Injects sequential id attributes into every <h2> in an HTML string */
export function injectH2Ids(html: string, sectionIdx: number): string {
  let h2Count = 0;
  return html.replace(/<h2(\s[^>]*)?>/gi, (_match, attrs) => {
    const id = `section-${sectionIdx}-h2-${h2Count++}`;
    return `<h2${attrs || ""} id="${id}">`;
  });
}

/** Extracts h2 text + generated ids from an HTML string */
export function extractH2Items(
  html: string,
  sectionIdx: number
): { id: string; text: string }[] {
  const items: { id: string; text: string }[] = [];
  let h2Count = 0;
  const regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const id = `section-${sectionIdx}-h2-${h2Count++}`;
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text) items.push({ id, text });
  }
  return items;
}

export default function PagesTabs({
  pages,
  platformName,
  theme,
  activePage,
  setActivePage,
  activeSection,
  sectionRefs,
}: {
  pages: any[];
  platformName: string;
  theme: any;
  activePage: number;
  setActivePage: (i: number) => void;
  activeSection: number | null;
  sectionRefs: MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const [highlightSection, setHighlightSection] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for drag scrolling
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // التحقق من حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // تأثير التمييز عند التمرير لقسم معين
  useEffect(() => {
    if (activeSection !== null) {
      setHighlightSection(activeSection);

      const timer = setTimeout(() => {
        setHighlightSection(null);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [activeSection]);

  // دالة التمرير للقسم المحدد من dropdown
  const handleSectionClick = (pageIdx: number, sectionIdx: number) => {
    if (pageIdx === activePage && sectionRefs.current[sectionIdx]) {
      sectionRefs.current[sectionIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Drag scroll functionality (للديسكتوب فقط)
  useEffect(() => {
    const slider = tabsContainerRef.current;
    if (!slider || isMobile) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      startX.current = e.pageX - slider.offsetLeft;
      scrollLeft.current = slider.scrollLeft;
      slider.style.cursor = 'grabbing';
      slider.style.userSelect = 'none';
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      slider.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      slider.style.cursor = 'grab';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();

      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      slider.scrollLeft = scrollLeft.current - walk;
    };

    const handleClick = (e: MouseEvent) => {
      if (isDragging.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);
    slider.addEventListener('click', handleClick, true);

    slider.style.cursor = 'grab';

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);
      slider.removeEventListener('click', handleClick, true);
    };
  }, [isMobile]);

  if (!pages.length) return null;

  // Debug: log pages order in PagesTabs
  console.log('PagesTabs received pages:', pages.map(p => ({ id: p.id, name: p.name, order: p.order })));

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes("watch?v=")) {
        const id = url.split("watch?v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes("youtube.com/embed/")) return url;
    } catch {
      return "";
    }
    return "";
  };

  return (
    <div className="mt-6  border border-[var(--glass-border)] rounded-2xl py-4 px-6 !bg-[#f2f2f273]">
      {/* Title - Dynamic based on active page */}
      
        <div className="mb-[30px]">
          <h2 className="text-[var(--text-primary)] font-semibold text-xl">
            طريقة تخصيص الثيم على منصة {platformName || "المنصة"}
          </h2>

          <div className="flex justify-start items-center gap-1 mt-1">
            <span className="w-36 h-[2px] bg-[var(--primary-color)] inline-block" />
           <span className="text-[var(--primary-color)] text-xs">✦</span>
            <span className="w-36 h-[2px] bg-[var(--primary-color)] inline-block" />
          </div>
        </div>

      <div
        ref={tabsContainerRef}
        className="flex mb-6 gap-2 md:gap-2 mt-2 flex-row overflow-x-auto catFilter scrollbar-hide"
        style={{
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {pages.map((page: any, pIdx: number) => (
          <Button
            key={pIdx}
            variant="solid"
            solidColor={activePage === pIdx ? "" : "var(--bg-secondary)"}
            className={`text-sm text-nowrap transition-all text-center justify-center min-w-28 ${activePage === pIdx
                ? "gradient-primary text-white !shadow-[inset_0px_2px_4px_0px_var(--shadow-color)]"
                : "!text-[var(--text-primary)] hover:!bg-[var(--bg-tertiary)]"
              } shadow-[inset_1px_4px_8px_rgb(14_19_44_/_6%),inset_-2px_-4px_10px_rgb(255_255_255_/_20%),inset_0_-1px_0px_#0E132C0F] select-none w-fit`}
            onClick={() => setActivePage(pIdx)}
          >
            {page.name}
          </Button>
        ))}
      </div>

      <div className="mb-6  md:hidden">
        <PagesDropdown
          pages={pages}
          onSectionClick={handleSectionClick}
          activePage={activePage}
        />
      </div>


      {/* محتوى الصفحة النشطة - يظهر تحت التبويبات أو dropdown */}
      {pages[activePage] && (
        <div className="rounded-2xl">
          {/* عنوان الصفحة النشطة (يظهر في الموبايل فقط) */}
          {isMobile && (
            <h3 className="text-[var(--primary-color)] font-bold text-lg mb-4 pr-2">
              {pages[activePage].name}
            </h3>
          )}

          {/* أقسام الصفحة مع المحتوى */}
          <div className="grid gap-8 ">
            {pages[activePage].sections?.map((section: any, sIdx: number) => (
              <div
                key={sIdx}
                id={`section-${sIdx}`}
                ref={(el) => {
                  sectionRefs.current[sIdx] = el;
                }}
                className={`space-y-4 p-4 rounded-2xl transition-shadow duration-300 border-b border-[var(--primary-color)] ${highlightSection === sIdx
                    ? "ring-2 ring-[var(--primary-color)]"
                    : ""
                  }`}
              >
                {/* عنوان القسم مع الرقم */}
                <p className="text-[var(--text-secondary)] text-sm font-medium items-center justify-start gap-2 inline-flex">
                  <span className="text-[var(--primary-color)] w-8 h-8 border-b border-[var(--primary-color)] rounded-full flex items-center justify-center font-bold text-sm !shadow-[inset_0px_2px_4px_0px_var(--shadow-color)]">
                    {sIdx + 1}
                  </span>
                  <span className="font-semibold text-base text-[var(--text-primary)]">
                    {section.title}
                  </span>
                </p>

                {/* فيديو القسم */}
                {section.videoLink && getEmbedUrl(section.videoLink) && (
                  <div className="w-full rounded-2xl overflow-hidden aspect-video">
                    <iframe
                      src={getEmbedUrl(section.videoLink)}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}

                {/* محتوى القسم النصي */}
                {section.content &&
                  section.content.replace(/<[^>]*>/g, "").trim() && (
                    <div
                      className="text-[var(--text-primary)] text-base font-normal leading-relaxed flex flex-col gap-2 theme-content"
                      dangerouslySetInnerHTML={{
                        __html: injectH2Ids(section.content, sIdx),
                      }}
                    />
                  )}  
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}