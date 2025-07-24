import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ProviderList } from "@/renderer/features/llm-provider/components/provider-list";
import { loadApiData } from "@/renderer/lib/route-loader";

function LLMProvidersLayout() {
  const { providers } = Route.useLoaderData();

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            AI Providers
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure and manage your AI language model providers
          </p>
        </div>

        {/* Provider List */}
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
