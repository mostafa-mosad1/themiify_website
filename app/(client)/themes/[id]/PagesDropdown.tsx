"use client";
import { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { extractH2Items } from "./PagesTab";

/* ─── Section sub-item component ─── */
function SectionItem({
  section,
  sectionIdx,
  pageIdx,
  isActive,
  onSectionClick,
  activeLinkId,
  isOpen,
  onToggle,
  onH2Click,
}: {
  section: any;
  sectionIdx: number;
  pageIdx: number;
  isActive: boolean;
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
    <li className="flex-1">
      {/* Section Row */}
      <button
        type="button"
        className={`w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-right transition-all duration-200 group/sec cursor-pointer ${
          isActive
            ? "bg-orange-50/80 dark:bg-orange-500/10 text-[var(--primary-color)] font-semibold"
            : "text-gray-600 dark:text-gray-300 hover:text-[var(--primary-color)] hover:bg-gray-50 dark:hover:bg-white/5"
        }`}
        onClick={() => {
          onSectionClick?.(pageIdx, sectionIdx);
          if (h2Items.length > 0) onToggle(sectionIdx, true);
        }}
      >
        {/* Hollow dot when inactive, filled dot when active */}
        <span
          className={`w-2 h-2 rounded-full border border-[var(--primary-color)] flex-shrink-0 transition-all duration-200 ${
            isActive
              ? "bg-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20"
              : "bg-white dark:bg-gray-900 group-hover/sec:bg-[var(--primary-color)]/30"
          }`}
        />
        <span className="text-xs md:text-sm flex-1 truncate text-right">
          {section.title}
        </span>
        {h2Items.length > 0 && (
          <FaChevronDown
            className={`text-[var(--primary-color)] text-[10px] transition-transform duration-200 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* H2 inner titles/headings if any */}
      {h2Items.length > 0 && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[9999px] opacity-100 mt-1" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col gap-1 pr-4">
            {h2Items.map((h2) => {
              const isH2Active = h2.id === activeLinkId;
              return (
                <li key={h2.id}>
                  <button
                    type="button"
                    className={`flex items-center justify-start gap-2 text-right w-full text-xs transition-colors duration-200 px-2.5 py-1 rounded-lg cursor-pointer ${
                      isH2Active
                        ? "text-[var(--primary-color)] bg-orange-50/70 dark:bg-orange-500/10 font-medium"
                        : "text-gray-400 hover:text-[var(--primary-color)] hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onH2Click(h2.id);
                      handleH2Click(h2.id);
                    }}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                        isH2Active
                          ? "bg-[var(--primary-color)]"
                          : "border border-gray-300 dark:border-gray-600 bg-transparent"
                      }`}
                    />
                    <span className="flex-1 text-right truncate">{h2.text}</span>
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

/* ─── Main Sidebar Dropdown / Accordion TOC ─── */
export default function PagesDropdown({
  pages,
  onSectionClick,
  activePage,
  setActivePage,
}: {
  pages: any[];
  onSectionClick?: (pageIdx: number, sectionIdx: number) => void;
  activePage: number;
  setActivePage?: (pageIdx: number) => void;
  activeSection?: number | null;
}) {
  // Accordion behavior: only the active page is open by default
  const [openPages, setOpenPages] = useState<number[]>([activePage]);
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);
  const [openSectionIdx, setOpenSectionIdx] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync open page with activePage
  useEffect(() => {
    setOpenPages([activePage]);
  }, [activePage]);

  // Dynamic ScrollSpy that calculates which section or H2 is currently in view
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

    const handleScroll = () => {
      const offset = 180;
      let currentActiveId = ids[0];

      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            currentActiveId = id;
          } else {
            break;
          }
        }
      }

      setActiveLinkId(currentActiveId);

      const parts = currentActiveId.split("-");
      if (parts.length >= 2 && parts[0] === "section") {
        const sIdx = parseInt(parts[1], 10);
        if (!isNaN(sIdx)) {
          setOpenSectionIdx(sIdx);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    const timer = setTimeout(handleScroll, 200);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, [pages, activePage]);

  if (!pages.length) return null;

  const togglePageOpen = (i: number) => {
    if (activePage !== i) {
      setActivePage?.(i);
      setOpenPages([i]);
    } else {
      setOpenPages((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
      );
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="bg-white/80 dark:bg-card-dark/80 backdrop-blur-md border border-gray-100 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm"
      dir="rtl"
    >
      {/* Header */}
      <div className="mb-4 text-center">
        <h2 className="text-[var(--text-primary)] font-bold text-base md:text-lg">
          محتوي دليل المستخدم
        </h2>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[var(--primary-color)] rounded-full" />
          <span className="text-[var(--primary-color)] text-xs">✦</span>
          <span className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[var(--primary-color)] rounded-full" />
        </div>
      </div>

      {/* Pages tree list with ALL pages and their sections */}
      <ul className="space-y-3">
        {pages.map((page, i) => {
          const isActivePage = i === activePage;
          const isPageOpen = openPages.includes(i);

          return (
            <li
              key={i}
              className={`rounded-2xl transition-all duration-200 ${
                isActivePage
                  ? "bg-transparent"
                  : "hover:bg-gray-50/50 dark:hover:bg-white/5"
              }`}
            >
              {/* Page header row */}
              <button
                type="button"
                className="w-full flex items-center justify-between gap-2 p-2 rounded-xl text-right cursor-pointer group"
                onClick={() => togglePageOpen(i)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors duration-200 ${isActivePage ? "bg-[var(--primary-color)]" : "bg-gray-300 dark:bg-gray-600"}`}
                  />
                  <span
                    className={`text-sm md:text-base transition-colors duration-200 ${
                      isActivePage
                        ? "text-[var(--primary-color)] font-bold"
                        : "text-gray-700 dark:text-gray-200 font-semibold group-hover:text-[var(--primary-color)]"
                    }`}
                  >
                    {page.name}
                  </span>
                </div>

                {page.sections?.length > 0 && (
                  <span className="text-[var(--primary-color)] p-1">
                    {isPageOpen ? (
                      <FaChevronUp size={12} />
                    ) : (
                      <FaChevronDown size={12} />
                    )}
                  </span>
                )}
              </button>

              {/* Sections list under this page */}
              {page.sections?.length > 0 && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isPageOpen
                      ? "max-h-[9999px] opacity-100 pr-3 pl-1 pt-1 pb-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="flex flex-col gap-1.5">
                    {page.sections.map((section: any, j: number) => {
                      const isDirectlyActive = activeLinkId === `section-${j}`;
                      const isChildH2Active = Boolean(
                        activeLinkId?.startsWith(`section-${j}-h2-`)
                      );
                      const isSecActive =
                        isActivePage &&
                        (isDirectlyActive ||
                          isChildH2Active ||
                          (!activeLinkId && j === 0));

                      return (
                        <SectionItem
                          key={j}
                          section={section}
                          sectionIdx={j}
                          pageIdx={i}
                          isActive={Boolean(isSecActive)}
                          onSectionClick={(pIdx, sIdx) => {
                            setActiveLinkId(`section-${sIdx}`);
                            onSectionClick?.(pIdx, sIdx);
                          }}
                          activeLinkId={activeLinkId}
                          isOpen={openSectionIdx === j}
                          onToggle={(idx, forceOpen) => {
                            setOpenSectionIdx((prev) =>
                              prev === idx && !forceOpen ? null : idx
                            );
                          }}
                          onH2Click={(id) => setActiveLinkId(id)}
                        />
                      );
                    })}
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