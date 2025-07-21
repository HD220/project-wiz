// vite.renderer.config.mts
import { lingui } from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@lingui/vite-plugin/dist/index.cjs";
import tailwindcss from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@tailwindcss/vite/dist/index.mjs";
import { tanstackRouter } from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import react from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { defineConfig } from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname =
  "D:\\Documentos\\Pessoal\\Github\\project-wiz";
var projectRoot = path.resolve(__vite_injected_original_dirname);
var vite_renderer_config_default = defineConfig({
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
export { vite_renderer_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5yZW5kZXJlci5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcRG9jdW1lbnRvc1xcXFxQZXNzb2FsXFxcXEdpdGh1YlxcXFxwcm9qZWN0LXdpelwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcRG9jdW1lbnRvc1xcXFxQZXNzb2FsXFxcXEdpdGh1YlxcXFxwcm9qZWN0LXdpelxcXFx2aXRlLnJlbmRlcmVyLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0RvY3VtZW50b3MvUGVzc29hbC9HaXRodWIvcHJvamVjdC13aXovdml0ZS5yZW5kZXJlci5jb25maWcubXRzXCI7aW1wb3J0IHsgbGluZ3VpIH0gZnJvbSBcIkBsaW5ndWkvdml0ZS1wbHVnaW5cIjtcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcbmltcG9ydCB7IHRhbnN0YWNrUm91dGVyIH0gZnJvbSBcIkB0YW5zdGFjay9yb3V0ZXItcGx1Z2luL3ZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcblxuY29uc3QgcHJvamVjdFJvb3QgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcm9vdDogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcInNyYy9yZW5kZXJlclwiKSxcbiAgcGx1Z2luczogW1xuICAgIHRhbnN0YWNrUm91dGVyKHtcbiAgICAgIHRhcmdldDogXCJyZWFjdFwiLFxuICAgICAgLy8gYXV0b0NvZGVTcGxpdHRpbmc6IHRydWUsXG4gICAgICByb3V0ZXNEaXJlY3Rvcnk6IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdCwgXCJzcmMvcmVuZGVyZXIvYXBwXCIpLFxuICAgICAgZ2VuZXJhdGVkUm91dGVUcmVlOiBwYXRoLnJlc29sdmUoXG4gICAgICAgIHByb2plY3RSb290LFxuICAgICAgICBcInNyYy9yZW5kZXJlci9yb3V0ZVRyZWUuZ2VuLnRzXCIsXG4gICAgICApLFxuICAgIH0pLFxuICAgIHJlYWN0KHtcbiAgICAgIHBsdWdpbnM6IFtbXCJAbGluZ3VpL3N3Yy1wbHVnaW5cIiwge31dXSxcbiAgICB9KSxcbiAgICB0YWlsd2luZGNzcygpLFxuICAgIGxpbmd1aSh7XG4gICAgICBjb25maWdQYXRoOiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsIFwibGluZ3VpLmNvbmZpZy50c1wiKSxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkAvdWlcIjogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcIi4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvdWkvXCIpLFxuICAgICAgXCJAL2NvbXBvbmVudHNcIjogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcInNyYy9yZW5kZXJlci9jb21wb25lbnRzL1wiKSxcbiAgICAgIFwiQC9saWJcIjogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcIi4vc3JjL3JlbmRlcmVyL2xpYi9cIiksXG4gICAgICBcIkAvaG9va3NcIjogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcIi4vc3JjL3JlbmRlcmVyL2hvb2tzL1wiKSxcbiAgICAgIFwiQC9mZWF0dXJlc1wiOiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsIFwiLi9zcmMvcmVuZGVyZXIvZmVhdHVyZXMvXCIpLFxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdCwgXCIuL3NyYy9cIiksXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3VSxTQUFTLGNBQWM7QUFDL1YsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyxzQkFBc0I7QUFDL0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLG9CQUFvQjtBQUw3QixJQUFNLG1DQUFtQztBQU96QyxJQUFNLGNBQWMsS0FBSyxRQUFRLGdDQUFTO0FBRTFDLElBQU8sK0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU0sS0FBSyxRQUFRLGFBQWEsY0FBYztBQUFBLEVBQzlDLFNBQVM7QUFBQSxJQUNQLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQTtBQUFBLE1BRVIsaUJBQWlCLEtBQUssUUFBUSxhQUFhLGtCQUFrQjtBQUFBLE1BQzdELG9CQUFvQixLQUFLO0FBQUEsUUFDdkI7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsTUFBTTtBQUFBLE1BQ0osU0FBUyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO0FBQUEsSUFDdEMsQ0FBQztBQUFBLElBQ0QsWUFBWTtBQUFBLElBQ1osT0FBTztBQUFBLE1BQ0wsWUFBWSxLQUFLLFFBQVEsYUFBYSxrQkFBa0I7QUFBQSxJQUMxRCxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsUUFBUSxLQUFLLFFBQVEsYUFBYSwrQkFBK0I7QUFBQSxNQUNqRSxnQkFBZ0IsS0FBSyxRQUFRLGFBQWEsMEJBQTBCO0FBQUEsTUFDcEUsU0FBUyxLQUFLLFFBQVEsYUFBYSxxQkFBcUI7QUFBQSxNQUN4RCxXQUFXLEtBQUssUUFBUSxhQUFhLHVCQUF1QjtBQUFBLE1BQzVELGNBQWMsS0FBSyxRQUFRLGFBQWEsMEJBQTBCO0FBQUEsTUFDbEUsS0FBSyxLQUFLLFFBQVEsYUFBYSxRQUFRO0FBQUEsSUFDekM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
