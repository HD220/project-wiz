import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

const projectRoot = path.resolve(__dirname); 

export default defineConfig({
  root: path.resolve(projectRoot, "src_refactored/presentation/ui"), // Corrected root
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: path.resolve(projectRoot, "src_refactored/presentation/ui/app"),
      generatedRouteTree: path.resolve(projectRoot, "src_refactored/presentation/ui/routeTree.gen.ts"),
    }),
    react({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    tailwindcss(),
    lingui({
      configPath: path.resolve(projectRoot, "lingui.config.ts"), // Make absolute from projectRoot
    }),
  ],
  resolve: {
    alias: {
      "@/": path.resolve(projectRoot, "src_refactored/presentation/ui/"), // Trailing slash is important for prefix replacement
      "@/components": path.resolve(projectRoot, "src_refactored/presentation/ui/components"),
      "@/features": path.resolve(projectRoot, "src_refactored/presentation/ui/features"),
      "@/hooks": path.resolve(projectRoot, "src_refactored/presentation/ui/hooks"),
      "@/lib": path.resolve(projectRoot, "src_refactored/presentation/ui/lib"),
      "@/services": path.resolve(projectRoot, "src_refactored/presentation/ui/services"),
      "@/styles": path.resolve(projectRoot, "src_refactored/presentation/ui/styles"),
      "@/app": path.resolve(projectRoot, "src_refactored/presentation/ui/app"),
      "@/ui": path.resolve(projectRoot, "src_refactored/presentation/ui/components/ui"),
      "@/shared": path.resolve(projectRoot, "src_refactored/shared"),
    },
  },
});
