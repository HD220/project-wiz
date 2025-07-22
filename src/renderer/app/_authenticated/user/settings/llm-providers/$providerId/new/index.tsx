import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ProviderForm } from "@/renderer/features/llm-provider/components/provider-form";

function NewProviderModal() {
  const navigate = useNavigate();

  function handleClose() {
    navigate({ to: "/user/settings/llm-providers" });
  }

  return <ProviderForm onClose={handleClose} />;
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/$providerId/new/",
)({
  component: NewProviderModal,
});
