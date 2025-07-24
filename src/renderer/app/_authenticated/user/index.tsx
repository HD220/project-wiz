import { createFileRoute } from "@tanstack/react-router";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { WelcomeView } from "@/renderer/features/app/components/welcome-view";

function UserPage() {
  const { userName } = Route.useLoaderData();

  return (
    <div className="flex-1 flex flex-col">
      <ContentHeader
        title="Área Pessoal"
        description="Converse com seus agentes pessoais"
      />
      <main className="flex-1 overflow-auto">
        <WelcomeView userName={userName} />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/")({
  loader: async ({ context }) => {
    const { auth } = context;
    return { userName: auth.user?.name || "User" };
  },
  component: UserPage,
});
