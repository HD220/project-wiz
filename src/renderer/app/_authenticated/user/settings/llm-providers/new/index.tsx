import { createFileRoute, useRouter } from "@tanstack/react-router";

import { ProviderForm } from "@/renderer/features/agent/components/provider/provider-form";

function NewProviderPage() {
  const router = useRouter();

  function handleClose() {
    // Navigate back to previous page
    router.history.back();
  }

  return <ProviderForm provider={null} onClose={handleClose} />;
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/new/",
)({
  component: NewProviderPage,
});
