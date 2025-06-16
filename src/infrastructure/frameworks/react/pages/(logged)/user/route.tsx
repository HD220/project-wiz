import { UserSidebar } from "@/components/sidebar/user-sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(logged)/user")({
  component: Layout,
});

export function Layout() {
  return (
    <div className="flex flex-1">
      <SidebarProvider open={false}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={25} minSize={0}>
            <UserSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            {/* <main className="h-screen "> */}
            <Outlet />
            {/* </main> */}
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarProvider>
    </div>
  );
}
