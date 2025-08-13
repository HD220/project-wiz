import { createFileRoute, Outlet } from "@tanstack/react-router";

import { UserSidebar } from "@/renderer/components/app/user-sidebar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/renderer/components/ui/resizable";

function UserLayout() {
  return (
    <div className="h-full w-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full"
        id="user-layout"
      >
        <ResizablePanel
          defaultSize={15}
          minSize={15}
          maxSize={35}
          className="min-w-0 overflow-hidden"
        >
          <UserSidebar />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel className="min-w-0">
          <main className="h-full w-full">
            <Outlet />
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user")({
  component: UserLayout,
});
