import "./styles/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { detectLocale, dynamicActivate } from "./i18n";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({ routeTree });
const root = createRoot(document.getElementById("root")!);

dynamicActivate(detectLocale()).then(() => {
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
});

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
);
