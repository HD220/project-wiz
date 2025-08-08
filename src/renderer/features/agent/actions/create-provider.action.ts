import { redirect } from "@tanstack/react-router";
import { z } from "zod";

import { LlmProviderSchema } from "@/shared/types/llm-provider";

// Schema for creating providers - omit auto-generated fields
const CreateProviderSchema = LlmProviderSchema.omit({
  id: true,
  ownerId: true,
  deactivatedAt: true,
  createdAt: true,
  updatedAt: true,
});

type CreateProviderInput = z.infer<typeof CreateProviderSchema>;

export async function createProviderAction(context: any, form: any) {
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
