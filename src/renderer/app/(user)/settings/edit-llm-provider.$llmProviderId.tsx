import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";

import { LlmProviderFormModal } from "@/renderer/features/llm-provider-management/components/llm-provider-form-modal";
import { useLlmProviders } from "@/renderer/features/llm-provider-management/hooks/use-llm-provider.hook";

export const Route = createFileRoute(
  "/(user)/settings/edit-llm-provider/$llmProviderId",
)({
  component: EditLlmProvider,
});

function EditLlmProvider() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { llmProviderId } = useParams({
    from: "/(user)/settings/edit-llm-provider/$llmProviderId",
  });
  const { llmProviders } = useLlmProviders();
  const provider = llmProviders?.find((p) => p.id === llmProviderId) || null;

  return (
    <LlmProviderFormModal
      isOpen={true}
      onClose={() => navigate({ to: "/settings" })}
      provider={provider}
    />
  );
}
