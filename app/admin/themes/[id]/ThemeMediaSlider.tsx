"use client";

import React, { useState } from "react";

interface ThemeMediaSliderProps {
  theme?: any;
  mediaUrls?: string[];
  themeName?: string;
}

export default function ThemeMediaSlider({
  theme,
  mediaUrls = [],
  themeName = "",
}: ThemeMediaSliderProps) {
  const getYoutubeEmbedUrl = (url?: string | null) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("embed/")) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const videoLink = theme?.video_link;
  const displayName = themeName || theme?.name || "ثيم";

  const allImages: string[] = [];
  if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
    for (const url of mediaUrls) {
      if (url && typeof url === "string" && !allImages.includes(url)) {
        allImages.push(url);
      }
    }
  }
  if (theme?.banner_url && !allImages.includes(theme.banner_url)) {
    allImages.unshift(theme.banner_url);
  }
  if (theme?.image_url && !allImages.includes(theme.image_url)) {
    allImages.push(theme.image_url);
  }
  if (Array.isArray(theme?.images)) {
    for (const img of theme.images) {
      if (typeof img === "string" && !allImages.includes(img)) {
        allImages.push(img);
      }
    }
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = allImages[activeIndex] || allImages[0] || "/images/placeholder.svg";

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div className="relative w-full h-[260px] bg-[var(--bg-primary)] rounded-3xl overflow-hidden shadow-sm border border-[var(--border-light)] flex items-center justify-center">
        {videoLink && allImages.length === 0 ? (
          <iframe
            src={getYoutubeEmbedUrl(videoLink)}
            className="w-full h-full object-cover"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={displayName}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={activeImage}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {allImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                activeIndex === idx
                  ? "border-[var(--primary-color)] scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${displayName} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}