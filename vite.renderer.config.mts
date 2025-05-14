import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/infrastructure/frameworks/react/pages",
      generatedRouteTree:
        "./src/infrastructure/frameworks/react/routeTree.gen.ts",
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
      "@/components/*": path.resolve(
        __dirname,
        "./src/infrastructure/frameworks/react/components"
      ),
      "@/ui/*": path.resolve(
        __dirname,
        "./src/infrastructure/frameworks/react/components/ui"
      ),
      "@/lib/*": path.resolve(
        __dirname,
        "./src/infrastructure/frameworks/react/lib"
      ),
      "@/hooks/*": path.resolve(
        __dirname,
        "./src/infrastructure/frameworks/react/hooks"
      ),
      "@": path.resolve(__dirname, "./src/infrastructure/frameworks/react"),
    },
  },
});
