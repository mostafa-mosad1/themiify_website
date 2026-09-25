"use client";
import { useState, useRef, useEffect } from "react";
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

  setTimeout(() => {
    setActiveSection(null);
  }, 1000);
};
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-9 space-y-4">
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

      <div className="col-span-3 space-y-4 sticky top-2 h-max">
        <PagesDropdown activePage={activePage} pages={pages} onSectionClick={handleSectionClick} />
       
        <YoutubeChannelCard
          videoUrl={theme.video_link}
          themeName={theme.name}
          themelist={theme.playlist_link}
        />
      </div>
    </div>
  );
}