import { defineConfig } from "vite";
import path from "path"; // Import path

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      // Updated for consistency
      "@/refactored": path.resolve(__dirname, "./src_refactored"),
      "@/refactored/core": path.resolve(__dirname, "./src_refactored/core"),
      "@/refactored/shared": path.resolve(__dirname, "./src_refactored/shared"),
      // Also include existing aliases if preload scripts might use them from 'src'
      "@/core": path.resolve(__dirname, "./src/core"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
