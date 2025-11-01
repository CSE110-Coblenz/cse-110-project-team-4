import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: 'jsdom', // enables document, window, etc.
  }
});