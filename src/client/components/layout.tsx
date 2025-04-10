import { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Sidebar } from "./sidebar";

export function Layout() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <I18nProvider i18n={i18n}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex flex-1 flex-col m-2 w-full">
            <Outlet />
          </div>
        </div>
        <Toaster />
        <TanStackRouterDevtools />
      </I18nProvider>
    </ThemeProvider>
  );
}