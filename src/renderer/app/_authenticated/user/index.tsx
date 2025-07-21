import { createFileRoute } from "@tanstack/react-router";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { WelcomeView } from "@/renderer/features/app/components/welcome-view";

function UserPage() {
  return (
    <div className="flex-1 flex flex-col">
      <ContentHeader
        title="Área Pessoal"
        description="Converse com seus agentes pessoais"
      />
      <main className="flex-1 overflow-auto">
        <WelcomeView />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/")({
  component: UserPage,
});
