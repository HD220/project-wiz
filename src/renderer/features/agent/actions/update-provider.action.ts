import { redirect } from "@tanstack/react-router";
import { z } from "zod";

import { LlmProviderSchema } from "@/shared/types/llm-provider";

// Schema for updating providers - omit auto-generated and immutable fields
const UpdateProviderSchema = LlmProviderSchema.omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

type UpdateProviderInput = z.infer<typeof UpdateProviderSchema>;

export async function updateProviderAction(
  context: any,
  params: any,
  form: any,
) {
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

  await window.api.llmProvider.update({ id: providerId, ...updateData });

  queryClient.invalidateQueries({ queryKey: ["llmProviders"] });

  return redirect({ to: "/user/settings/llm-providers" });
}
