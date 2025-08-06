import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    rollupOptions: {
      external: ["better-sqlite3", "pino", "pino-pretty"],
      output: {
        // Preserve module structure for IPC handlers
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      }
    },
  },
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./src"),
    },
  },
});
