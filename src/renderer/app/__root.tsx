import {
  createRootRouteWithContext,
  Outlet,
  useRouter,
} from "@tanstack/react-router";

import { Titlebar } from "@/renderer/components/layout/titlebar";
import { Toaster } from "@/renderer/components/ui/sonner";
import type { AuthContextType } from "@/renderer/contexts/auth.context";

interface RouterContext {
  auth: AuthContextType;
}

function RootComponent() {
  const router = useRouter();
  const isLoading = router.state.isLoading;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
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
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
