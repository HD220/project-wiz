import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

import { ProviderList } from "@/renderer/features/llm-provider/components/provider-list";
import { useLLMProvidersStore } from "@/renderer/store/llm-provider.store";

function LLMProvidersLayout() {
  const { loadProviders } = useLLMProvidersStore();

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">AI Providers</h1>
          <p className="text-muted-foreground text-sm">
            Configure and manage your AI language model providers
          </p>
        </div>

        {/* Provider List */}
        <ProviderList />
      </div>
      
      {/* Modals/Child Routes */}
      <Outlet />
    </>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers",
)({
  component: LLMProvidersLayout,
});
