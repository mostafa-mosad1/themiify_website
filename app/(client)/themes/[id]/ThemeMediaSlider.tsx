"use client";

import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface ThemeMediaSliderProps {
  images?: string[];
  themeName?: string;
}

export default function ThemeMediaSlider({
  images = [],
  themeName = "",
}: ThemeMediaSliderProps) {
  const displayName = themeName || "ثيم";
  const imageList = images.filter(
    (image, index): image is string =>
      typeof image === "string" && image.length > 0 && images.indexOf(image) === index
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = imageList[activeIndex] || imageList[0] || "/images/placeholder.svg";
  const showPrevious = () =>
    setActiveIndex((index) => (index - 1 + imageList.length) % imageList.length);
  const showNext = () =>
    setActiveIndex((index) => (index + 1) % imageList.length);

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] bg-black/5 dark:bg-white/5 rounded-2xl md:rounded-3xl overflow-hidden border border-white/60 dark:border-white/10 shadow-md flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={displayName}
          className="w-full h-full object-cover transition-all duration-300"
        />
        {imageList.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="الصورة السابقة"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70"
            >
              <FaChevronRight />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="الصورة التالية"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70"
            >
              <FaChevronLeft />
            </button>
          </>
        )}
      </div>
    </div>
  );
}