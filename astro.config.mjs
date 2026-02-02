import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL || "https://example.github.io/grota-board-games-list",
  output: "static"
});
