"use client";

import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useThemeContext } from "@/lib/providers/ThemeProvider";

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useThemeContext();

  return ( 
    <button
      onClick={toggleTheme}
      className="
        relative
        inline-flex
        items-center
        justify-center
        w-10
        h-10
        rounded-lg
        transition-all
        duration-300
        ease-in-out
        
        bg-[var(--bg-tertiary)]
        hover:bg-[var(--bg-secondary)]
        
        text-[var(--text-primary)]
        
        border
        border-[var(--border-color)]
        
        focus:outline-none
        focus:ring-2
        focus:ring-primary
        focus:ring-offset-2
        
        hover:shadow-sm
      "
      style={{
        boxShadow: `0 0 0 0 var(--shadow-sm)`,
      }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {/* Sun Icon - visible in light mode */}
      <FiSun
        size={20}
        className={`
          absolute
          transition-all
          duration-300
          ${isDark ? "opacity-0 scale-0 rotate-180" : "opacity-100 scale-100 rotate-0"}
        `}
      />

      {/* Moon Icon - visible in dark mode */}
      <FiMoon
        size={20}
        className={`
          absolute
          transition-all
          duration-300
          ${isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-180"}
        `}
      />
    </button>
  );
};

export default ThemeToggle;
