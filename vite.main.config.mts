import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    rollupOptions: {
      external: [
        "better-sqlite3", 
        "pino", 
        "pino-pretty",
        // Don't bundle IPC handlers - keep them external for dynamic import
        /src\/main\/ipc\/.*/
      ],
    },
  },
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./src"),
    },
  },
});
