import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ProviderForm } from "@/renderer/features/llm-provider/components/provider-form";

function NewProviderModal() {
  const navigate = useNavigate();
  const { userId } = Route.useLoaderData();

  function handleClose() {
    navigate({ to: "/user/settings/llm-providers" });
  }

  return <ProviderForm onClose={handleClose} userId={userId} />;
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/$providerId/new/",
)({
  loader: async ({ context }) => {
    const { auth } = context;
    return { userId: auth.user?.id || "" };
  },
  component: NewProviderModal,
});
