import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: { external: ["better-sqlite3"] },
  },
  resolve: {
    alias: {
      "@/core": path.resolve(__dirname, "./src/core"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@": path.resolve(__dirname, "./src"),
      // Updated for consistency with tsconfig and new convention
      "@/refactored": path.resolve(__dirname, "./src_refactored"),
      "@/refactored/core": path.resolve(__dirname, "./src_refactored/core"),
      "@/refactored/shared": path.resolve(__dirname, "./src_refactored/shared"),
    },
  },
});
