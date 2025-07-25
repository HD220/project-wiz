import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { ProviderForm } from "@/renderer/features/llm-provider/components/provider-form";

function NewProviderDialog() {
  const navigate = useNavigate();

  function handleClose() {
    navigate({
      to: "/user/settings/llm-providers",
      search: { showArchived: false },
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Provider</DialogTitle>
        </DialogHeader>

        <ProviderForm provider={null} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/$providerId/new/",
)({
  component: NewProviderDialog,
});
