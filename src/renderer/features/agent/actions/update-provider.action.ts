import { Action, redirect } from "@tanstack/react-router";
import { LlmProviderSchema } from "@/shared/types/llm-provider";
import { z } from "zod";

// Schema for updating providers - omit auto-generated and immutable fields
const UpdateProviderSchema = LlmProviderSchema.omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

type UpdateProviderInput = z.infer<typeof UpdateProviderSchema>;

export const updateProviderAction = new Action({
  fn: async ({ context, params, form }) => {
    const { queryClient } = context;
    const { user } = context.auth;
    const providerId = params.providerId as string;

    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const updateData: UpdateProviderInput = {
      ...form,
      baseUrl: form.baseUrl || null,
    };

    await window.api.llmProvider.update(providerId, updateData);

    queryClient.invalidateQueries({ queryKey: ["llmProviders"] });

    return redirect({ to: "/user/settings/llm-providers" });
  },
});
