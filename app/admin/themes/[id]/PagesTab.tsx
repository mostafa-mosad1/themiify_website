"use client";
import { MutableRefObject } from "react";
import Button from "@/components/ui/Button";

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
  if (!pages.length) return null;

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
      {/* Header */}
      <div className="mb-[30px]">
        <h2 className="text-[var(--text-primary)] font-semibold text-xl">
          طريقة تخصيص الثيم علي منصة {platformName}
        </h2>
        <div className="flex justify-start items-center gap-1 mt-1">
          <span className="w-36 h-[2px] bg-[var(--primary-color)] inline-block" />
          <span className="text-[var(--primary-color)] text-xs">✦</span>
          <span className="w-36 h-[2px] bg-[var(--primary-color)] inline-block" />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap mb-6">
        {pages.map((page: any, pIdx: number) => (
          <Button
            key={pIdx}
            variant="solid"
            solidColor={activePage === pIdx ? "" : "var(--bg-secondary)"}
            className={`text-sm transition-all text-center justify-center w-[150px] ${
              activePage === pIdx
                ? "gradient-primary text-white shadow-md"
                : "!text-[var(--text-primary)] hover:!bg-[var(--bg-tertiary)]"
            } shadow-[inset_1px_4px_8px_rgb(14_19_44_/_6%),inset_-2px_-4px_10px_rgb(255_255_255_/_20%),inset_0_-1px_0px_#0E132C0F]`}
            onClick={() => setActivePage(pIdx)}
          >
            {page.name}
          </Button>
        ))}
      </div>

      {/* CONTENT */}
      {pages[activePage] && (
        <div className="rounded-2xl">
          <div className="grid gap-8">
            {pages[activePage].sections?.map((section: any, sIdx: number) => (
              <div
                key={sIdx}
                ref={(el) => {
                  sectionRefs.current[sIdx] = el;
                }}
                className={`space-y-4 p-4 rounded-2xl transition-all duration-300  border-b border-[var(--primary-color)] ${
                  activeSection === sIdx
                    ? "bg-[var(--bg-tertiary)] ring-2 ring-[var(--primary-color)]/20"
                    : ""
                }`}
              >
                 <p className="text-[var(--text-secondary)] text-sm font-medium items-center justify-start gap-2 inline-flex">
                          <span className="text-[var(--primary-color)] w-8 h-8 border-b border-[var(--primary-color)] rounded-full flex items-center justify-center font-bold text-sm !shadow-[inset_0px_2px_4px_0px_var(--shadow-color)]">
                            {sIdx + 1}
                          </span>
                          <span className="font-semibold text-base text-[var(--text-primary)]">
                            {section.title}
                          </span>
                        </p>
                {/* فيديو */}
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

                {/* المحتوى */}
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