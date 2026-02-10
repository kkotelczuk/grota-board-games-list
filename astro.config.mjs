import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves project sites at /<repo-name>/; base must match for assets and routes.
const siteUrl =
  process.env.SITE_URL || "https://example.github.io/grota-board-games-list";
const base = (() => {
  try {
    const pathname = new URL(siteUrl).pathname;
    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname || "/";
  } catch {
    return "/";
  }
})();

export default defineConfig({
  site: siteUrl,
  base,
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
