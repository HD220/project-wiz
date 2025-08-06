import { Action, redirect } from "@tanstack/react-router";
import { CreateProviderInput } from "@/renderer/features/agent/provider.types";

export const updateProviderAction = new Action({
  fn: async ({ context, params, form }) => {
    const { queryClient } = context;
    const { user } = context.auth;
    const providerId = params.providerId as string;

    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const updateData: Partial<CreateProviderInput> = {
      ...form,
      baseUrl: form.baseUrl || null,
    };

    await window.api.llmProviders.update(providerId, updateData);

    queryClient.invalidateQueries({ queryKey: ["llmProviders"] });

    return redirect({ to: "/user/settings/llm-providers" });
  },
});
