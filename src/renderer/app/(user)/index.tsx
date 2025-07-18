import { createFileRoute } from "@tanstack/react-router";

import { PageTitle } from "@/components/page-title";

import { DashboardCards } from "@/features/users/components/dashboard-cards";

export const Route = createFileRoute("/(user)/")({
  component: UserDashboardPage,
});

export function UserDashboardPage() {
  return (
    <div className="p-4">
      <PageTitle title="Dashboard" />
      <DashboardCards />
    </div>
  );
}
