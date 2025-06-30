import { defineConfig } from "vitest/config";
import path from "path";
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    // setupFiles: [path.resolve(__dirname, "./tests/test-setup.ts")], // Commented out as it's causing issues and tests are self-contained
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src_refactored/**/*.ts"], // Coverage also scoped
    },
    include: ['src_refactored/**/*.spec.ts', 'src_refactored/**/*.test.ts'],
  },
});
