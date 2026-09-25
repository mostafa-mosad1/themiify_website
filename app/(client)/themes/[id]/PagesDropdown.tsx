"use client";
import { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { extractH2Items } from "./PagesTab";

/* ─── Sub-component so useState can be called at top-level ─── */
function SectionItem({
  section,
  sectionIdx,
  pageIdx,
  isMobile,
  onSectionClick,
  activeLinkId,
  isOpen,
  onToggle,
  onH2Click,
}: {
  section: any;
  sectionIdx: number;
  pageIdx: number;
  isMobile: boolean;
  onSectionClick?: (pageIdx: number, sectionIdx: number) => void;
  activeLinkId?: string | null;
  isOpen: boolean;
  onToggle: (idx: number, forceOpen?: boolean) => void;
  onH2Click: (id: string) => void;
}) {
  const h2Items = section.content
    ? extractH2Items(section.content, sectionIdx)
    : [];



  const handleH2Click = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <li className={`${isMobile ? "flex-shrink-0" : "flex-1"}`}>
      {/* Section row */}
      <div
        className={`flex items-center justify-start gap-2 cursor-pointer group/section hover:bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 transition-all duration-200 ${
          isOpen ? "bg-[var(--bg-tertiary)]" : ""
        }`}
        onClick={() => {
          onSectionClick?.(pageIdx, sectionIdx);
          if (h2Items.length > 0 && !isMobile) onToggle(sectionIdx);
        }}
      >
        <span className={`w-[6px] h-[6px] rounded-full border-2 border-[var(--primary-color)] flex-shrink-0 group-hover/section:bg-[var(--primary-color)] transition-all duration-200 ${
          isOpen ? "bg-[var(--primary-color)]" : ""
        }`} />
        <span className={`text-sm font-normal whitespace-nowrap group-hover/section:text-[var(--primary-color)] transition-all duration-200 flex-1 ${
          isOpen ? "text-[var(--primary-color)] font-medium" : "text-[var(--text-secondary)]"
        }`}>
          {section.title}
        </span>
        {h2Items.length > 0 && !isMobile && (
          <FaChevronDown
            className={`text-[var(--primary-color)] text-[10px] transition-all duration-200 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* H2 sub-links – desktop only */}
      {h2Items.length > 0 && !isMobile && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col gap-1 mt-1 pr-5 border-r-2 border-[var(--primary-color)]/20 mr-3">
            {h2Items.map((h2) => {
              const isH2Active = h2.id === activeLinkId;
              return (
                <li key={h2.id}>
                  <button
                    className={`flex items-center justify-start gap-2 text-right w-full text-xs transition-colors duration-200 px-2 py-[5px] rounded-md hover:bg-[var(--bg-tertiary)] leading-snug ${
                      isH2Active
                        ? "text-[var(--primary-color)] bg-[var(--bg-tertiary)] font-medium"
                        : "text-[var(--text-tertiary)] hover:text-[var(--primary-color)]"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onH2Click(h2.id);
                      handleH2Click(h2.id);
                    }}
                  >
                    <span className={`w-1 h-1 rounded-full flex-shrink-0 transition-all duration-200 ${
                      isH2Active ? "bg-[var(--primary-color)]" : "bg-transparent"
                    }`} />
                    <span className="flex-1 text-right">{h2.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}

/* ─── Main dropdown ─── */
export default function PagesDropdown({
  pages,
  onSectionClick,
  activePage,
}: {
  pages: any[];
  onSectionClick?: (pageIdx: number, sectionIdx: number) => void;
  activePage: number;
}) {
  const [openSections, setOpenSections] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);
  const [openSectionIdx, setOpenSectionIdx] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setOpenSections([activePage]);
    setOpenSectionIdx(null);
  }, [activePage]);

  // Track active section and h2 links via IntersectionObserver
  useEffect(() => {
    const activePageData = pages[activePage];
    if (!activePageData || !activePageData.sections) return;

    const ids: string[] = [];
    activePageData.sections.forEach((sec: any, sIdx: number) => {
      ids.push(`section-${sIdx}`);
      if (sec.content) {
        const items = extractH2Items(sec.content, sIdx);
        items.forEach((item) => ids.push(item.id));
      }
    });

    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveLinkId(id);
            
            const parts = id.split("-");
            if (parts.length >= 2 && parts[0] === "section") {
              const sIdx = parseInt(parts[1], 10);
              if (!isNaN(sIdx)) {
                setOpenSectionIdx(sIdx);
              }
            }
          }
        });
      },
      { rootMargin: "-10% 0px -40% 0px", threshold: 0 }
    );

    const timer = setTimeout(() => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pages, activePage]);

  if (!pages.length) return null;

  const toggleSection = (i: number) => {
    setOpenSections((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="lg:mt-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-4 scrollbar-hide"
      style={{ WebkitOverflowScrolling: isMobile ? "touch" : "auto" }}
    >
      {/* Header */}
      <div className="mb-4 hidden lg:block">
        <h2 className="text-[var(--text-primary)] font-bold text-base">
          محتوي دليل المستخدم
        </h2>
        <div className="flex justify-start items-center gap-1 mt-1">
          <span className="w-20 h-[2px] bg-[var(--primary-color)] inline-block" />
          <span className="text-[var(--primary-color)] text-xs">✦</span>
          <span className="w-20 h-[2px] bg-[var(--primary-color)] inline-block" />
        </div>
      </div>

      {/* Pages list – only active page shown */}
      <ul className="space-y-3 overflow-y-auto md:h-[95vh]">
        {pages.map((page, i) => {
          if (i !== activePage) return null;

          const isOpen = openSections.includes(i);

          return (
            <li key={i}>
              {/* Page header row */}
              <div
                className="flex items-center justify-start gap-2 cursor-pointer group"
                onClick={() => toggleSection(i)}
              >
                <span className="w-2 h-2 bg-[var(--primary-color)] rounded-full flex-shrink-0" />
                <div className="flex items-center justify-between w-full">
                  <span className="text-[var(--primary-color)] font-medium text-base group-hover:text-[var(--text-primary)] transition-all duration-300">
                    {page.name}
                  </span>
                  {page.sections?.length > 0 && (
                    <FaChevronDown
                      className={`text-[var(--primary-color)] text-xs group-hover:text-[var(--text-primary)] transition-all duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Sections + h2 sub-links */}
              {page.sections?.length > 0 && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "max-h-[9999px] opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <ul
                    className={`sectionList flex gap-2 ${
                      isMobile
                        ? "overflow-x-auto scrollbar-hide max-w-full pb-2"
                        : "flex-col"
                    }`}
                  >
                    {page.sections.map((section: any, j: number) => (
                      <SectionItem
                        key={j}
                        section={section}
                        sectionIdx={j}
                        pageIdx={i}
                        isMobile={isMobile}
                        onSectionClick={onSectionClick}
                        activeLinkId={activeLinkId}
                        isOpen={openSectionIdx === j}
                        onToggle={(idx, forceOpen) => {
                          setOpenSectionIdx(prev => (prev === idx && !forceOpen ? null : idx));
                        }}
                        onH2Click={(id) => setActiveLinkId(id)}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}