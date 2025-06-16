import { ScrollArea } from "@/components/ui/scroll-area";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(logged)/user/user-guides")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ScrollArea>
      <main className="h-screen ">
        <Outlet />
      </main>
    </ScrollArea>
  );
}
