import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: { external: ["better-sqlite3"] },
  },
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./src_refactored"),
    },
  },
});
