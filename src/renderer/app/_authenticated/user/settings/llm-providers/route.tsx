import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ProviderList } from "@/renderer/features/llm-provider/components/provider-list";
import { loadApiData } from "@/renderer/lib/route-loader";

function LLMProvidersLayout() {
  const { providers } = Route.useLoaderData();

  return (
    <>
      {/* Discord-style Settings Layout */}
      <div className="flex flex-col h-full bg-background">
        <ProviderList providers={providers} />
      </div>

      {/* Modals/Child Routes */}
      <Outlet />
    </>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers",
)({
  loader: async () => {
    const providers = await loadApiData(
      () => window.api.llmProviders.list(),
      "Failed to load providers",
    );
    return { providers };
  },
  component: LLMProvidersLayout,
});
