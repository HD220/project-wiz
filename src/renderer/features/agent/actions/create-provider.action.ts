import { redirect } from "@tanstack/react-router";
import { z } from "zod";

import { LlmProviderSchema } from "@/shared/types/llm-provider";

// Schema for creating providers - omit auto-generated fields
const _CreateProviderSchema = LlmProviderSchema.omit({
  id: true,
  ownerId: true,
  deactivatedAt: true,
  createdAt: true,
  updatedAt: true,
});

type CreateProviderInput = z.infer<typeof _CreateProviderSchema>;

interface ActionContext {
  queryClient: {
    invalidateQueries: (options: { queryKey: string[] }) => void;
  };
  auth: {
    user?: { id: string } | null;
  };
}

export async function createProviderAction(
  context: ActionContext,
  form: CreateProviderInput,
) {
  const { queryClient } = context;
  const { user } = context.auth;

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const createData: CreateProviderInput = {
    ...form,
    baseUrl: form.baseUrl || null,
  };

  await window.api.llmProvider.create(createData);

  queryClient.invalidateQueries({ queryKey: ["llmProviders"] });

  return redirect({ to: "/user/settings/llm-providers" });
}
