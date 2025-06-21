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
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/core": path.resolve(__dirname, "./src/core"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@/core/domain/entities/job/value-objects": path.resolve(
        __dirname,
        "./src/core/domain/entities/job/value-objects"
      ),
      "@/infrastructure/repositories": path.resolve(
        __dirname,
        "./src/infrastructure/repositories"
      ),
      "@/infrastructure/frameworks/electron": path.resolve(
        __dirname,
        "./src/infrastructure/frameworks/electron"
      ),
    },
  },
});
