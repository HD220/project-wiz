import { createFileRoute, Navigate } from "@tanstack/react-router";

function SettingsIndex() {
  // Redirect to appearance since My Account page was removed
  return <Navigate to="/user/settings/appearance" search={{}} />;
}

export const Route = createFileRoute("/_authenticated/user/settings/")({
  component: SettingsIndex,
});
