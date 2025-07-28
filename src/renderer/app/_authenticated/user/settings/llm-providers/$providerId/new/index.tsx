import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ProviderForm } from "@/renderer/features/agent/components/provider/provider-form";

function NewProviderDialog() {
  const navigate = useNavigate();

  function handleClose() {
    navigate({
      to: "/user/settings/llm-providers",
    });
  }

  return <ProviderForm provider={null} onClose={handleClose} />;
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/$providerId/new/",
)({
  component: NewProviderDialog,
});
