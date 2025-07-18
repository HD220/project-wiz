import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { LlmProviderFormModal } from "@/features/llm/components";

export const Route = createFileRoute("/(user)/settings/new-llm-provider")({
  component: NewLlmProvider,
});

function NewLlmProvider() {
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <LlmProviderFormModal
      isOpen={true}
      onClose={() => navigate({ to: "/settings" })}
      provider={null}
    />
  );
}
