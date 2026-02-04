import { useState, useEffect, useCallback } from "react";
import type { ViewMode, ThemeMode } from "../../types";

const STORAGE_KEYS = {
  viewMode: "grota-view-mode",
  theme: "grota-theme",
} as const;

interface UseViewPreferencesReturn {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

/**
 * Safely reads from localStorage
 */
function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely writes to localStorage
 */
function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silent fail - localStorage might be unavailable
  }
}

/**
 * Gets initial theme based on localStorage or system preference
 */
function getInitialTheme(): ThemeMode {
  const stored = safeLocalStorageGet(STORAGE_KEYS.theme);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Check system preference
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return "light";
}

/**
 * Gets initial view mode from localStorage
 */
function getInitialViewMode(): ViewMode {
  const stored = safeLocalStorageGet(STORAGE_KEYS.viewMode);
  if (stored === "grid" || stored === "list") {
    return stored;
  }
  return "grid";
}

/**
 * Applies theme to document
 */
function applyTheme(theme: ThemeMode): void {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
}

/**
 * Hook for managing view preferences with localStorage persistence
 */
export function useViewPreferences(): UseViewPreferencesReturn {
  const [viewMode, setViewModeState] = useState<ViewMode>("grid");
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initialViewMode = getInitialViewMode();
    const initialTheme = getInitialTheme();

    setViewModeState(initialViewMode);
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setIsInitialized(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no explicit preference is stored
      const stored = safeLocalStorageGet(STORAGE_KEYS.theme);
      if (!stored) {
        const newTheme = e.matches ? "dark" : "light";
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    safeLocalStorageSet(STORAGE_KEYS.viewMode, mode);
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    safeLocalStorageSet(STORAGE_KEYS.theme, newTheme);
    applyTheme(newTheme);
  }, []);

  // Return default values during SSR/initial render
  if (!isInitialized) {
    return {
      viewMode: "grid",
      setViewMode,
      theme: "light",
      setTheme,
    };
  }

  return {
    viewMode,
    setViewMode,
    theme,
    setTheme,
  };
}
