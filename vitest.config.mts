import { defineConfig } from "vitest/config";
import path from "path";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: [path.resolve(__dirname, "./tests/test-setup.ts")],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"], // Coverage also scoped
    },
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
  },
});
