import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

const projectRoot = path.resolve(__dirname); // Define projectRoot as the directory of vite.renderer.config.mts

// https://vitejs.dev/config
export default defineConfig({
  // root: path.resolve(__dirname, "./src_refactored/presentation/ui"), // This was causing issues
  root: path.resolve(projectRoot, "src_refactored/presentation/ui"), // Corrected root
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      // Corrected paths to be absolute from the vite config file's perspective initially, then make them relative to projectRoot
      routesDirectory: path.resolve(projectRoot, "src_refactored/presentation/ui/app"),
      generatedRouteTree: path.resolve(projectRoot, "src_refactored/presentation/ui/routeTree.gen.ts"),
    }),
    react({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    tailwindcss(), // This plugin should correctly find tailwind.config.ts if it's in the project root or specified
    lingui({
      // configPath should be relative to the project root where package.json is, or absolute
      configPath: path.resolve(projectRoot, "lingui.config.ts"), // Make absolute from projectRoot
    }),
  ],
  resolve: {
    alias: {
      // The root for aliases is `src_refactored/presentation/ui` as defined by `config.root`
      // So, "@/some/path" should resolve to `src_refactored/presentation/ui/some/path`
      "@/": path.resolve(projectRoot, "src_refactored/presentation/ui/"), // Trailing slash is important for prefix replacement
      // Specific aliases can override or complement the main "@/"
      "@/components": path.resolve(projectRoot, "src_refactored/presentation/ui/components"),
      "@/features": path.resolve(projectRoot, "src_refactored/presentation/ui/features"),
      "@/hooks": path.resolve(projectRoot, "src_refactored/presentation/ui/hooks"),
      "@/lib": path.resolve(projectRoot, "src_refactored/presentation/ui/lib"),
      "@/services": path.resolve(projectRoot, "src_refactored/presentation/ui/services"),
      "@/styles": path.resolve(projectRoot, "src_refactored/presentation/ui/styles"),
      "@/app": path.resolve(projectRoot, "src_refactored/presentation/ui/app"),
      "@ui": path.resolve(projectRoot, "src_refactored/presentation/ui/components/ui"),
      "@shared": path.resolve(projectRoot, "src_refactored/shared"),
      // Ensure that `routeTree.gen.ts` can be imported as ` '@/routeTree.gen'`
      // The file is generated at `src_refactored/presentation/ui/routeTree.gen.ts`
      // So the alias "@/routeTree.gen" should work given "@/" points to "src_refactored/presentation/ui/"
    },
  },
  // server: {
  //   fs: {
  //     strict: false,
  //   }
  // }
});
