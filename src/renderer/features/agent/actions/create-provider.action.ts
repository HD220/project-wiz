import { Action, redirect } from "@tanstack/react-router";
import { LlmProviderSchema } from "@/shared/types/llm-provider";
import { z } from "zod";

// Schema for creating providers - omit auto-generated fields
const CreateProviderSchema = LlmProviderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

type CreateProviderInput = z.infer<typeof CreateProviderSchema>;

export const createProviderAction = new Action({
  fn: async ({ context, params, form }) => {
    const { queryClient } = context;
    const { user } = context.auth;

    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const createData: CreateProviderInput = {
      ...form,
      ownerId: user.id,
      baseUrl: form.baseUrl || null,
    };

    await window.api.llmProvider.create(createData);

    queryClient.invalidateQueries({ queryKey: ["llmProviders"] });

    return redirect({ to: "/user/settings/llm-providers" });
  },
});
