import { ThemeProvider } from "@/components/providers/theme";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@lingui/react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { i18n } from "../i18n";

export const Route = createRootRoute({
  component: Layout,
});

export function Layout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <I18nProvider i18n={i18n}>
        <>
          <Outlet />
          <Toaster />
        </>
        {/* <TanStackRouterDevtools /> */}
      </I18nProvider>
    </ThemeProvider>
  );
}
