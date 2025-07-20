import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { MessageSquare, Settings, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createRootRoute({
  component: () => (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Project Wiz</h1>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings/agents">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
});
