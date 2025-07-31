import { createFileRoute } from "@tanstack/react-router";

import { WelcomeView } from "@/renderer/components/app/welcome-view";
import { ContentHeader } from "@/renderer/components/layout/content-header";

function UserPage() {
  return (
    <div className="flex-1 flex flex-col h-full">
      <ContentHeader
        title="Personal Area"
        description="Chat with your personal AI agents"
      />
      <main className="flex-1 min-h-0">
        <WelcomeView />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/")({
  loader: async () => {
    return {};
  },
  component: UserPage,
});
