import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: [path.resolve(__dirname, "./tests/test-setup.ts")],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.mts", "vite.*.mts"],
    },
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@/core", replacement: path.resolve(__dirname, "src/core") },
      { find: "@/shared", replacement: path.resolve(__dirname, "src/shared") },
      { find: "@/infrastructure", replacement: path.resolve(__dirname, "src/infrastructure") },
      {
        find: "@/core/domain/entities/job/value-objects",
        replacement: path.resolve(
          __dirname,
          "src/core/domain/entities/job/value-objects"
        ),
      },
      {
        find: "@/infrastructure/repositories",
        replacement: path.resolve(
          __dirname,
          "src/infrastructure/repositories"
        ),
      },
      {
        find: "@/infrastructure/frameworks/electron",
        replacement: path.resolve(
          __dirname,
          "src/infrastructure/frameworks/electron"
        ),
      },
      { find: "@refactored", replacement: path.resolve(__dirname, "src_refactored") },
    ],
  },
});
