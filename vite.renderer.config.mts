import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  root: path.resolve(__dirname, "./src_refactored/presentation/ui"),
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: path.resolve(__dirname, "./src_refactored/presentation/ui/app"),
      generatedRouteTree: path.resolve(__dirname, "./src_refactored/presentation/ui/routeTree.gen.ts"),
    }),
    react({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    tailwindcss(),
    lingui({
      configPath: "./lingui.config.ts",
    }),
  ],
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./src_refactored/presentation/ui"),
      "@/components": path.resolve(__dirname, "./src_refactored/presentation/ui/components"),
      "@/ui": path.resolve(__dirname, "./src_refactored/presentation/ui/components/ui"),
      "@/config": path.resolve(__dirname, "./src_refactored/presentation/ui/config"),
      "@/hooks": path.resolve(__dirname, "./src_refactored/presentation/ui/hooks"),
      "@/lib": path.resolve(__dirname, "./src_refactored/presentation/ui/lib"),

    },
  },
});
