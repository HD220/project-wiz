import { createFileRoute, Outlet } from "@tanstack/react-router";

function SettingsLayout() {
  return (
    <div className="flex-1 p-6">
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/settings")({
  component: SettingsLayout,
});