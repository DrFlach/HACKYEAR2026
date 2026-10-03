import { defineConfig } from "vitest/config";
import path from "path";

// Vitest config for the pure check functions in /lib/checks.
// No DOM environment needed: checks are plain TS functions, not React components.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "data/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
