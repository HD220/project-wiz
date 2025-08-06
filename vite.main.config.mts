import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    rollupOptions: {
      external: ["better-sqlite3", "pino", "pino-pretty"],
      output: {
        // Use manual chunks to separate IPC handlers
        manualChunks: (id) => {
          if (id.includes('src/main/ipc/')) {
            // Create separate chunks for each IPC handler
            const match = id.match(/src\/main\/ipc\/(.+)\/invoke\.ts$/);
            if (match) {
              return `ipc/${match[1]}/invoke`;
            }
          }
          return null;
        }
      }
    },
  },
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./src"),
    },
  },
});
