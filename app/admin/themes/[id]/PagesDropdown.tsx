"use client";
import { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { extractH2Items } from "./PagesTab";

/* ─── Sub-component so useState is called at top-level (Rules of Hooks) ─── */
function SectionItem({
  section,
  sectionIdx,
  pageIdx,
  onSectionClick,
}: {
  section: any;
  sectionIdx: number;
  pageIdx: number;
  onSectionClick?: (pageIdx: number, sectionIdx: number) => void;
}) {
  const [subOpen, setSubOpen] = useState(false);

  const h2Items = section.content
    ? extractH2Items(section.content, sectionIdx)
    : [];

  const handleH2Click = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <li>
      {/* Section row */}
      <div
        className="flex items-center justify-start gap-2 cursor-pointer group/section hover:bg-[var(--bg-tertiary)] rounded-lg px-2 py-1 transition-all duration-200"
        onClick={() => {
          onSectionClick?.(pageIdx, sectionIdx);
          if (h2Items.length > 0) setSubOpen((v) => !v);
        }}
      >
        <span className="w-[6px] h-[6px] rounded-full border-2 border-[var(--primary-color)] flex-shrink-0 group-hover/section:bg-[var(--primary-color)] transition-all duration-200" />
        <span className="text-[var(--text-secondary)] text-sm font-normal group-hover/section:text-[var(--primary-color)] transition-all duration-200 flex-1">
          {section.title}
        </span>
        {h2Items.length > 0 && (
          <FaChevronDown
            className={`text-[var(--primary-color)] text-[10px] transition-all duration-200 flex-shrink-0 ${
              subOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* H2 sub-links */}
      {h2Items.length > 0 && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            subOpen ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col gap-1 mt-1 pr-5 border-r-2 border-[var(--primary-color)]/20 mr-3">
            {h2Items.map((h2) => (
              <li key={h2.id}>
                <button
                  className="text-right w-full text-xs text-[var(--text-tertiary)] hover:text-[var(--primary-color)] transition-colors duration-200 px-2 py-[5px] rounded-md hover:bg-[var(--bg-tertiary)] leading-snug"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleH2Click(h2.id);
                  }}
                >
                  {h2.text}
                </button>
              </li>
            ))}
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

  useEffect(() => {
    setOpenSections([activePage]);
  }, [activePage]);

  if (!pages.length) return null;

  const toggleSection = (i: number) => {
    setOpenSections((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  return (
    <div className="lg:mt-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-4 overflow-y-auto h-[95vh]">
      {/* Header */}
      <div className="mb-4">
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
      <ul className="space-y-3">
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
                  <ul className="space-y-1 pr-6">
                    {page.sections.map((section: any, j: number) => (
                      <SectionItem
                        key={j}
                        section={section}
                        sectionIdx={j}
                        pageIdx={i}
                        onSectionClick={onSectionClick}
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