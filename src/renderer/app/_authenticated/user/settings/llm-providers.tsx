import { createFileRoute } from "@tanstack/react-router";
import { Bot, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/renderer/components/ui/button";
import { ProviderList } from "@/renderer/features/llm-provider/components/provider-list";
import { useLLMProvidersStore } from "@/renderer/store/llm-provider.store";

function LLMProvidersPage() {
  const navigate = Route.useNavigate();
  const { loadProviders } = useLLMProvidersStore();

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/user/settings" })}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Bot className="h-8 w-8" />
          <h1 className="text-3xl font-bold">AI Providers</h1>
        </div>
        <p className="text-muted-foreground">
          Configure and manage your AI language model providers
        </p>
      </div>

      <ProviderList />
    </div>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers",
)({
  component: LLMProvidersPage,
});
