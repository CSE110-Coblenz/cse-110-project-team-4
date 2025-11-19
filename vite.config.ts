import { defineConfig } from "vitest/config";
export default defineConfig({
  base: "/cse-110-project-team-4/", // for Github - settings - pages
  test: {
    environment: 'jsdom',
  }
});
