import { createFileRoute, Outlet } from "@tanstack/react-router";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import { ProviderList } from "@/renderer/features/llm-provider/components/provider-list";

function LLMProvidersLayout() {
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
  loader: async ({ context }) => {
    const { auth } = context;

    // Defensive check - ensure user exists
    if (!auth.user?.id) {
      throw new Error("User not authenticated");
    }

    const response = await window.api.llmProviders.list(auth.user.id);
    if (!response.success) {
      throw new Error(response.error || "Failed to load providers");
    }
    return {
      providers: response.data as LlmProvider[],
      userId: auth.user.id,
    };
  },
  component: LLMProvidersLayout,
});
