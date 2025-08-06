import { Action, redirect } from "@tanstack/react-router";
import { CreateProviderInput } from "@/renderer/features/agent/provider.types";

export const createProviderAction = new Action({
  fn: async ({ context, params, form }) => {
    const { queryClient } = context;
    const { user } = context.auth;

    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const createData: CreateProviderInput = {
      ...form,
      userId: user.id,
      baseUrl: form.baseUrl || null,
    };

    await window.api.llmProviders.create(createData);

    queryClient.invalidateQueries({ queryKey: ["llmProviders"] });

    return redirect({ to: "/user/settings/llm-providers" });
  },
});
