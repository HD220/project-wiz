// vite.renderer.config.mts
import path from "path";
import tailwindcss from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@tailwindcss/vite/dist/index.mjs";
import { lingui } from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@lingui/vite-plugin/dist/index.cjs";
import react from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { tanstackRouter } from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import { defineConfig } from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "D:\\Documentos\\Pessoal\\Github\\project-wiz";
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
        "src/renderer/routeTree.gen.ts"
      )
    }),
    react({
      plugins: [["@lingui/swc-plugin", {}]]
    }),
    tailwindcss(),
    lingui({
      configPath: path.resolve(projectRoot, "lingui.config.ts")
    })
  ],
  resolve: {
    alias: {
      "@/ui": path.resolve(projectRoot, "./src/renderer/components/ui/"),
      "@/components": path.resolve(projectRoot, "src/renderer/components/"),
      "@/lib": path.resolve(projectRoot, "./src/renderer/lib/"),
      "@/hooks": path.resolve(projectRoot, "./src/renderer/hooks/"),
      "@/features": path.resolve(projectRoot, "./src/renderer/features/"),
      "@/shared": path.resolve(projectRoot, "./src/shared/"),
      "@": path.resolve(projectRoot, "./src/")
    }
  }
});
export {
  vite_renderer_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5yZW5kZXJlci5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcRG9jdW1lbnRvc1xcXFxQZXNzb2FsXFxcXEdpdGh1YlxcXFxwcm9qZWN0LXdpelwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcRG9jdW1lbnRvc1xcXFxQZXNzb2FsXFxcXEdpdGh1YlxcXFxwcm9qZWN0LXdpelxcXFx2aXRlLnJlbmRlcmVyLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0RvY3VtZW50b3MvUGVzc29hbC9HaXRodWIvcHJvamVjdC13aXovdml0ZS5yZW5kZXJlci5jb25maWcubXRzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcbmltcG9ydCB7IGxpbmd1aSB9IGZyb20gXCJAbGluZ3VpL3ZpdGUtcGx1Z2luXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHsgdGFuc3RhY2tSb3V0ZXIgfSBmcm9tIFwiQHRhbnN0YWNrL3JvdXRlci1wbHVnaW4vdml0ZVwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcblxuY29uc3QgcHJvamVjdFJvb3QgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcm9vdDogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcInNyYy9yZW5kZXJlclwiKSxcbiAgcGx1Z2luczogW1xuICAgIHRhbnN0YWNrUm91dGVyKHtcbiAgICAgIHRhcmdldDogXCJyZWFjdFwiLFxuICAgICAgLy8gYXV0b0NvZGVTcGxpdHRpbmc6IHRydWUsXG4gICAgICByb3V0ZXNEaXJlY3Rvcnk6IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdCwgXCJzcmMvcmVuZGVyZXIvYXBwXCIpLFxuICAgICAgZ2VuZXJhdGVkUm91dGVUcmVlOiBwYXRoLnJlc29sdmUoXG4gICAgICAgIHByb2plY3RSb290LFxuICAgICAgICBcInNyYy9yZW5kZXJlci9yb3V0ZVRyZWUuZ2VuLnRzXCIsXG4gICAgICApLFxuICAgIH0pLFxuICAgIHJlYWN0KHtcbiAgICAgIHBsdWdpbnM6IFtbXCJAbGluZ3VpL3N3Yy1wbHVnaW5cIiwge31dXSxcbiAgICB9KSxcbiAgICB0YWlsd2luZGNzcygpLFxuICAgIGxpbmd1aSh7XG4gICAgICBjb25maWdQYXRoOiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsIFwibGluZ3VpLmNvbmZpZy50c1wiKSxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkAvdWlcIjogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcIi4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvdWkvXCIpLFxuICAgICAgXCJAL2NvbXBvbmVudHNcIjogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcInNyYy9yZW5kZXJlci9jb21wb25lbnRzL1wiKSxcbiAgICAgIFwiQC9saWJcIjogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcIi4vc3JjL3JlbmRlcmVyL2xpYi9cIiksXG4gICAgICBcIkAvaG9va3NcIjogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcIi4vc3JjL3JlbmRlcmVyL2hvb2tzL1wiKSxcbiAgICAgIFwiQC9mZWF0dXJlc1wiOiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsIFwiLi9zcmMvcmVuZGVyZXIvZmVhdHVyZXMvXCIpLFxuICAgICAgXCJAL3NoYXJlZFwiOiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsIFwiLi9zcmMvc2hhcmVkL1wiKSxcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsIFwiLi9zcmMvXCIpLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1UsT0FBTyxVQUFVO0FBQ3pWLE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsY0FBYztBQUN2QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxzQkFBc0I7QUFDL0IsU0FBUyxvQkFBb0I7QUFMN0IsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTSxjQUFjLEtBQUssUUFBUSxnQ0FBUztBQUUxQyxJQUFPLCtCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNLEtBQUssUUFBUSxhQUFhLGNBQWM7QUFBQSxFQUM5QyxTQUFTO0FBQUEsSUFDUCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUE7QUFBQSxNQUVSLGlCQUFpQixLQUFLLFFBQVEsYUFBYSxrQkFBa0I7QUFBQSxNQUM3RCxvQkFBb0IsS0FBSztBQUFBLFFBQ3ZCO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxNQUNKLFNBQVMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztBQUFBLElBQ3RDLENBQUM7QUFBQSxJQUNELFlBQVk7QUFBQSxJQUNaLE9BQU87QUFBQSxNQUNMLFlBQVksS0FBSyxRQUFRLGFBQWEsa0JBQWtCO0FBQUEsSUFDMUQsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLFFBQVEsS0FBSyxRQUFRLGFBQWEsK0JBQStCO0FBQUEsTUFDakUsZ0JBQWdCLEtBQUssUUFBUSxhQUFhLDBCQUEwQjtBQUFBLE1BQ3BFLFNBQVMsS0FBSyxRQUFRLGFBQWEscUJBQXFCO0FBQUEsTUFDeEQsV0FBVyxLQUFLLFFBQVEsYUFBYSx1QkFBdUI7QUFBQSxNQUM1RCxjQUFjLEtBQUssUUFBUSxhQUFhLDBCQUEwQjtBQUFBLE1BQ2xFLFlBQVksS0FBSyxRQUFRLGFBQWEsZUFBZTtBQUFBLE1BQ3JELEtBQUssS0FBSyxRQUFRLGFBQWEsUUFBUTtBQUFBLElBQ3pDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
