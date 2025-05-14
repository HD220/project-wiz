import { ProjectSidebar } from "@/components/sidebar/project-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/project")({
  component: Layout,
});

export function Layout() {
  return (
    <div className="flex flex-1">
      {/* <SidebarProvider className=""> */}
      {/* <ProjectSidebar /> */}
      <main>
        <Outlet />
      </main>
      {/* </SidebarProvider> */}
    </div>
  );
}
