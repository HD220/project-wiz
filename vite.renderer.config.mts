import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

const projectRoot = path.resolve(__dirname);

export default defineConfig({
  root: path.resolve(projectRoot, "src/renderer"),
  plugins: [
    tanstackRouter({
      target: "react",
      // autoCodeSplitting: true,
      routesDirectory: path.resolve(projectRoot, "src/renderer/app"),
      generatedRouteTree: path.resolve(
        projectRoot,
        "src/renderer/routeTree.gen.ts",
      ),
    }),
    react({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    tailwindcss(),
    lingui({
      configPath: path.resolve(projectRoot, "lingui.config.ts"),
    }),
  ],
  resolve: {
    alias: {
      "@/ui": path.resolve(projectRoot, "./src/renderer/components/ui/"),
      "@/components": path.resolve(projectRoot, "src/renderer/components/"),
      "@/lib": path.resolve(projectRoot, "./src/renderer/lib/"),
      "@/hooks": path.resolve(projectRoot, "./src/renderer/hooks/"),
      "@/features": path.resolve(projectRoot, "./src/renderer/features/"),
      "@": path.resolve(projectRoot, "./src/"),
    },
  },
});
