import { createFileRoute, Outlet } from "@tanstack/react-router";

function AuthLayout() {
  return (
    <div className="h-full bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});