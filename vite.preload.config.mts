import { defineConfig } from "vite";
import path from "path"; // Import path

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      // Ensure "@/refactored" is defined before "@"
      "@/refactored": path.resolve(__dirname, "./src_refactored"),
      // Aliases for original 'src' directory
      "@/core": path.resolve(__dirname, "./src/core"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@": path.resolve(__dirname, "./src"), // General alias for ./src
      // Specific sub-aliases for @/refactored are removed as per instruction
    },
  },
});
