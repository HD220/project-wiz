import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ProviderFiltersSchema } from "@/renderer/features/agent/provider.schema";
import { ProviderList } from "@/renderer/features/agent/components/provider/provider-list";
import { loadApiData } from "@/renderer/lib/route-loader";

function LLMProvidersLayout() {
  const providers = Route.useLoaderData();
  const search = Route.useSearch();

  return (
    <>
      {/* Discord-style Settings Layout */}
      <div className="flex flex-col h-full bg-background">
        <ProviderList
          providers={providers}
          showInactive={search.showInactive}
        />
      </div>

      {/* Modals/Child Routes */}
      <Outlet />
    </>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers",
)({
  validateSearch: (search) => ProviderFiltersSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps }) => {
    // Load providers with proper filtering
    const providers = await loadApiData(
      () => window.api.llmProviders.list(deps.search),
      "Failed to load providers",
    );

    return providers;
  },
  component: LLMProvidersLayout,
});
