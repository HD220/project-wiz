import { GeneralSidebar } from "@/components/sidebar/general-sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/general")({
  component: Layout,
});

export function Layout() {
  return (
    <div className="flex flex-1">
      <SidebarProvider open={false}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={25} minSize={0} maxSize={50}>
            <GeneralSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <main>
              <Outlet />
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarProvider>
    </div>
  );
}
