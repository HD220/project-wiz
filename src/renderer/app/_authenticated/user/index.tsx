import { createFileRoute } from "@tanstack/react-router";
import { WelcomeView } from "@/features/dashboard/components/welcome-view";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";

function UserPage() {
  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader title="Área Pessoal" description="Converse com seus agentes pessoais" />
      <main className="flex-1 overflow-auto">
        <WelcomeView />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/")({
  component: UserPage,
});