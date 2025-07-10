import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    rollupOptions: {
      external: ["better-sqlite3", "@/main/core/domain/common/base.entity"],
    },
  },
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "../.."),
    },
  },
});
