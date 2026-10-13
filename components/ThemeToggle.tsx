"use client";

import { useTheme } from "@/lib/theme";

interface ThemeToggleProps {
  size?: "sm" | "md";
  className?: string;
  showLabels?: boolean;
}

export default function ThemeToggle({
  size = "md",
  className = "",
  showLabels = false,
}: ThemeToggleProps) {
  const { isDark, toggleTheme, setTheme } = useTheme();

  // Dimensions based on size
  const isSm = size === "sm";

  const trackWidth = isSm ? "w-10" : "w-12";
  const trackHeight = isSm ? "h-5" : "h-6";
  const thumbSize = isSm ? "w-4 h-4" : "w-5 h-5";
  // In small mode: translate 20px (w-10 = 40px, padding 2px on each side, thumb 16px -> travel 40-16-4 = 20px)
  // In md mode: translate 24px (w-12 = 48px, padding 2px on each side, thumb 20px -> travel 48-20-4 = 24px)
  const thumbTranslate = isSm ? "translate-x-5" : "translate-x-6";
  const iconSize = isSm ? "w-4 h-4" : "w-4.5 h-4.5";

  return (
    <div
      className={`inline-flex items-center gap-1.5 sm:gap-2 select-none ${className}`}
      role="group"
      aria-label="Theme mode toggle"
    >
      {/* Sun Icon (Left) - Clicking explicitly switches to Light Mode (button1.png style) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setTheme("light");
        }}
        aria-label="Switch to Light Mode"
        title="Light Mode"
        className={`p-1 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8262A] ${
          !isDark
            ? "text-black scale-105 opacity-100"
            : "text-neutral-400 hover:text-white opacity-60 hover:opacity-100"
        }`}
      >
        <svg
          className={`${iconSize} transition-colors duration-300`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Center Sun Disc */}
          <circle cx="12" cy="12" r="4" />
          {/* 8 Radiating Rays matching button1.png / button2.png */}
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" />
          <path d="M19.07 4.93l-1.41 1.41" />
        </svg>
      </button>

      {/* Pill Toggle Switch (Middle) - Exact replica of button1.png & button2.png */}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={(e) => {
          e.stopPropagation();
          toggleTheme();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleTheme();
          }
        }}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        title={isDark ? "Activate Light Mode" : "Activate Dark Mode"}
        className={`relative inline-flex items-center ${trackWidth} ${trackHeight} rounded-full p-0.5 cursor-pointer transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8262A] focus-visible:ring-offset-2 shrink-0 ${
          isDark
            ? "!bg-white shadow-[0_0_14px_rgba(255,255,255,0.35)]"
            : "!bg-[#D1D5DB] hover:!bg-[#C2C6CD]"
        }`}
      >
        {/* Sliding Thumb Knob:
            In Light Mode (button1.png): White circle on the Left
            In Dark Mode (button2.png): Black circle on the Right */}
        <span
          className={`pointer-events-none inline-block ${thumbSize} rounded-full transform transition-all duration-300 ease-in-out shrink-0 ${
            isDark
              ? `${thumbTranslate} !bg-black shadow-sm`
              : "translate-x-0.5 !bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
          }`}
        />
      </button>

      {/* Crescent Moon Icon (Right) - Clicking explicitly switches to Dark Mode (button2.png style) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setTheme("dark");
        }}
        aria-label="Switch to Dark Mode"
        title="Dark Mode"
        className={`p-1 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8262A] ${
          isDark
            ? "text-white scale-105 opacity-100"
            : "text-black/70 hover:text-black opacity-60 hover:opacity-100"
        }`}
      >
        <svg
          className={`${iconSize} transition-colors duration-300`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Crescent Moon matching button1.png / button2.png */}
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      {showLabels && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-300 ml-1">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </div>
  );
}
