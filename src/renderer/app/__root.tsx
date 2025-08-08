import {
  createRootRouteWithContext,
  Outlet,
  useRouter,
} from "@tanstack/react-router";

import { Titlebar } from "@/renderer/components/layout/titlebar";
import { Toaster } from "@/renderer/components/ui/sonner";
import type { AuthContextType } from "@/renderer/contexts/auth.context";
import { getRendererLogger } from "@/shared/services/logger/renderer";

const logger = getRendererLogger("root");

interface RouterContext {
  auth: AuthContextType;
}

function RootComponent() {
  const router = useRouter();
  const isLoading = router.state.isLoading;
  
  logger.info("RootComponent rendered", { isLoading });

  return (
    <div
      className="h-screen flex flex-col overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, var(--background), rgba(128, 128, 128, 0.05))`,
        backgroundSize: "100% 100%, 100% 100%",
        backgroundRepeat: "repeat, no-repeat",
      }}
    >
      {/* Overlay for stripe pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            repeating-linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.02) 0px,
              rgba(255, 255, 255, 0.02) 3px,
              rgba(255, 255, 255, 0) 200px
            )
          `,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        <Titlebar />
        <div className="flex-1 overflow-hidden relative">
          {/* Loading overlay during navigation */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          )}
          <Outlet />
        </div>
        <Toaster />
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
