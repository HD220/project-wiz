import { createFileRoute, useRouter } from "@tanstack/react-router";

import { ProviderForm } from "@/renderer/features/agent/components/provider/provider-form";
import { loadApiData } from "@/renderer/lib/route-loader";

function EditProviderDialog() {
  const router = useRouter();
  const { provider } = Route.useLoaderData();

  function handleClose() {
    // Navigate back to previous page
    router.history.back();
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
      () => window.api.llmProvider.get(providerId),
      "Failed to load provider",
    );

    return { provider };
  },
  component: EditProviderDialog,
});
