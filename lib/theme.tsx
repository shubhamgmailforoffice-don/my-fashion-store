"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "driivn_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Apply theme to HTML element and localStorage
  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {}
    // Dispatch custom event for cross-component and window sync
    window.dispatchEvent(new CustomEvent("driivn-theme-changed", { detail: newTheme }));
  }, []);

  // Initialize theme from localStorage or document class on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === "dark" || stored === "light") {
        setThemeState(stored);
        applyTheme(stored);
      } else {
        // Fallback to checking document class (which might have been set by the inline script)
        const isCurrentlyDark = document.documentElement.classList.contains("dark");
        const detectedTheme: Theme = isCurrentlyDark ? "dark" : "light";
        setThemeState(detectedTheme);
        applyTheme(detectedTheme);
      }
    } catch {
      setThemeState("light");
    }

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      if (customEvent.detail && (customEvent.detail === "dark" || customEvent.detail === "light")) {
        setThemeState(customEvent.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
        setThemeState(e.newValue);
        if (typeof document !== "undefined") {
          if (e.newValue === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      }
    };

    window.addEventListener("driivn-theme-changed", handleSync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("driivn-theme-changed", handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, [applyTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [theme, setTheme]);

  const isDark = mounted ? theme === "dark" : false;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return a safe fallback if used outside ThemeProvider
    return {
      theme: "light" as Theme,
      isDark: false,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
