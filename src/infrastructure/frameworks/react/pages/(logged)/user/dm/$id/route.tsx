import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(logged)/user/dm/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="h-screen ">
      <Outlet />
    </main>
  );
}
