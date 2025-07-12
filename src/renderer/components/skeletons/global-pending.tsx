import { TooltipProvider } from "@/ui/tooltip";
import { PageTitleProvider } from "@/renderer/contexts/page-title-context";
import { TitleBar } from "@/renderer/components/layout/title-bar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function GlobalPending() {
  return (
    <TooltipProvider>
      <PageTitleProvider>
        <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
          <TitleBar />
          <div className="flex flex-1 w-full overflow-hidden">
            <AppSidebar />
            <div className="flex-1 w-full overflow-hidden bg-background">
              {/* Subtle loading content */}
              <div className="h-full w-full flex flex-col">
                {/* Top bar skeleton */}
                <div className="h-12 px-4 flex items-center border-b border-border">
                  <Skeleton className="h-6 w-32" />
                </div>
                
                {/* Content skeleton */}
                <div className="flex-1 p-6 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="space-y-2 pt-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTitleProvider>
    </TooltipProvider>
  );
}