"use client";
import { useState, useRef } from "react";
import PagesDropdown from "./PagesDropdown";
import PagesTabs from "./PagesTab";
import YoutubeChannelCard from "./Youtubechannelcard";

export default function ThemeGrid({
  pages,
  platformName,
  theme,
}: {
  pages: any[];
  platformName: string;
  theme: any;
}) {
  const [activePage, setActivePage] = useState(0);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleSectionClick = (pageIdx: number, sectionIdx: number) => {
    setActivePage(pageIdx);
    setActiveSection(sectionIdx);
    setTimeout(() => {
      sectionRefs.current[sectionIdx]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="grid grid-cols-12 gap-6 items-start">
      <div className="col-span-12 lg:col-span-9 space-y-4">
        <PagesTabs
          pages={pages}
          platformName={platformName}
          theme={theme}
          activePage={activePage}
          setActivePage={setActivePage}
          activeSection={activeSection}
          sectionRefs={sectionRefs}
        />
      </div>

      <div className="col-span-12 lg:col-span-3 space-y-6 sticky top-24 self-start">
        <PagesDropdown
          pages={pages}
          activePage={activePage}
          setActivePage={setActivePage}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
        <YoutubeChannelCard
          videoUrl={theme.video_link}
          themeName={theme.name}
          themelist={theme.playlist_link}
        />
      </div>
    </div>
  );
}