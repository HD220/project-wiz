import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { ApiKeyField } from "./fields/ApiKeyField";
import { BaseUrlField } from "./fields/BaseUrlField";
import { ConfigNameField } from "./fields/ConfigNameField";
import { ProviderSelectField } from "./fields/ProviderSelectField";

const llmConfigSchema = z
  .object({
    name: z.string().min(1, "O nome da configuração é obrigatório."),
    providerId: z.enum(["openai", "deepseek", "ollama"], {
      required_error: "Selecione um provedor LLM.",
    }),
    apiKey: z.string().optional(),
    baseUrl: z
      .string()
      .url("Insira uma URL válida.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.providerId !== "ollama" && !data.apiKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A Chave de API é obrigatória para este provedor.",
        path: ["apiKey"],
      });
    }
    if (
      data.providerId === "ollama" &&
      (!data.baseUrl || data.baseUrl.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A URL Base é obrigatória para o provedor Ollama.",
        path: ["baseUrl"],
      });
    }
  });

export type LLMConfigFormData = z.infer<typeof llmConfigSchema>;

interface LLMConfigFormProps {
  onSubmit: (data: LLMConfigFormData) => Promise<void> | void;
  initialValues?: Partial<LLMConfigFormData>;
  isSubmitting?: boolean;
}

export function LLMConfigForm({
  onSubmit,
  initialValues,
  isSubmitting,
}: LLMConfigFormProps) {
  const form = useForm<LLMConfigFormData>({
    resolver: zodResolver(llmConfigSchema),
    defaultValues: {
      name: initialValues?.name || "",
      providerId: initialValues?.providerId || undefined,
      apiKey: initialValues?.apiKey || "",
      baseUrl: initialValues?.baseUrl || "",
    },
  });

  const watchedProvider = form.watch("providerId");

  const handleFormSubmit = async (data: LLMConfigFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting LLM config form:", error);
      toast.error("Ocorreu um erro ao salvar a configuração. Tente novamente.");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <ConfigNameField control={form.control} />
        <ProviderSelectField control={form.control} />
        <ApiKeyField control={form.control} watchedProvider={watchedProvider} />
        <BaseUrlField control={form.control} />

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isDirty}
          >
            {isSubmitting
              ? "Salvando..."
              : initialValues?.name
                ? "Atualizar Configuração"
                : "Salvar Configuração"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
