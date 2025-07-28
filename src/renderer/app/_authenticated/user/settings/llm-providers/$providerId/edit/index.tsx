import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ProviderForm } from "@/renderer/features/llm-provider/components/provider-form";
import { loadApiData } from "@/renderer/lib/route-loader";

function EditProviderDialog() {
  const navigate = useNavigate();
  const { provider } = Route.useLoaderData();

  function handleClose() {
    navigate({
      to: "/user/settings/llm-providers",
    });
  }

  if (!provider) {
    return null;
  }

  return <ProviderForm provider={provider} onClose={handleClose} />;
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/$providerId/edit/",
)({
  loader: async ({ params }) => {
    const { providerId } = params;

    const provider = await loadApiData(
      () => window.api.llmProviders.getById(providerId),
      "Failed to load provider",
    );

    return { provider };
  },
  component: EditProviderDialog,
});
