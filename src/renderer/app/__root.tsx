import { createRootRoute, Outlet } from "@tanstack/react-router";

import { TitleBar } from "@/renderer/components/layout/title-bar";
import { PageTitleProvider } from "@/renderer/contexts/page-title-context";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { GlobalPending } from "@/components/skeletons/global-pending";
import { TooltipProvider } from "@/ui/tooltip";

export const Route = createRootRoute({
  component: RootComponent,
  pendingComponent: GlobalPending,
});

function RootComponent() {
  return (
    <TooltipProvider>
      <PageTitleProvider>
        <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
          <TitleBar />
          <div className="flex flex-1 w-full overflow-hidden">
            <AppSidebar />
            <div className="flex-1 w-full overflow-hidden bg-background">
              <Outlet />
            </div>
          </div>
        </div>
      </PageTitleProvider>
    </TooltipProvider>
  );
}
