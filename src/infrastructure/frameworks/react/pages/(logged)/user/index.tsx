import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(logged)/user/")({
  component: UserHomePage, // Renamed component for clarity
});

function UserHomePage() {
  return <UserDashboard />;
}
