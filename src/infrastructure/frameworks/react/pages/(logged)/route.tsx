import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(logged)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <Outlet />
    </div>
  );
}
