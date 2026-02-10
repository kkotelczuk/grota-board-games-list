import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Base URL from Astro/Vite config (e.g. '/' or '/grota-board-games-list/').
 * Used so assets work when the app is served from a subpath (e.g. GitHub Pages).
 */
const BASE =
  typeof import.meta !== "undefined" && import.meta.env?.BASE_URL != null
    ? (import.meta.env.BASE_URL as string)
    : "/";

/**
 * Resolves an asset path with the correct base URL.
 * Use for all public assets (images, favicons) so they work on GitHub Pages subpath.
 */
export function assetUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const b = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE;
  return b === "" ? p : b + p;
}

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
