import { defineConfig } from "vitest/config";
import path from "path";
import viteTsconfigPaths from 'vite-tsconfig-paths'; // Uncommented

export default defineConfig({
  plugins: [viteTsconfigPaths()], // Uncommented
  test: {
    globals: true,
    environment: "node",
    setupFiles: [path.resolve(__dirname, "./tests/test-setup.ts")],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts", "src_refactored/**/*.ts", "vite.*.mts"],
    },
  },
});
