import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { ProviderForm } from "@/renderer/features/llm-provider/components/provider-form";
import { loadApiData } from "@/renderer/lib/route-loader";

function EditProviderDialog() {
  const navigate = useNavigate();
  const { provider } = Route.useLoaderData();

  function handleClose() {
    navigate({
      to: "/user/settings/llm-providers",
      search: { showArchived: false },
    });
  }

  if (!provider) {
    return null;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Provider</DialogTitle>
        </DialogHeader>

        <ProviderForm provider={provider} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
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
