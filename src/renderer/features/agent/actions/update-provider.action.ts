import { redirect } from "@tanstack/react-router";
import { z } from "zod";

import { LlmProviderSchema } from "@/shared/types/llm-provider";

// Schema for updating providers - omit auto-generated and immutable fields
const _UpdateProviderSchema = LlmProviderSchema.omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

type UpdateProviderInput = z.infer<typeof _UpdateProviderSchema>;

interface ActionContext {
  queryClient: {
    invalidateQueries: (options: { queryKey: string[] }) => void;
  };
  auth: {
    user?: { id: string } | null;
  };
}

interface ActionParams {
  providerId: string;
}

export async function updateProviderAction(
  context: ActionContext,
  params: ActionParams,
  form: UpdateProviderInput,
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
