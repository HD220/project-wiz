import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  CreatePersonaTemplateRequest,
  CreatePersonaTemplateResponseData,
  PersonaTemplate,
  UpdatePersonaTemplateRequest,
  UpdatePersonaTemplateResponseData,
} from "@/shared/ipc-types";

import { usePersonaToolManagement } from "../hooks/usePersonaToolManagement";

import { PersonaBackstoryField } from "./fields/PersonaBackstoryField";
import { PersonaGoalField } from "./fields/PersonaGoalField";
import { PersonaNameField } from "./fields/PersonaNameField";
import { PersonaRoleField } from "./fields/PersonaRoleField";
import { PersonaToolsField } from "./fields/PersonaToolsField";

const personaTemplateFormSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, "Nome deve ter ao menos 3 caracteres.")
    .max(100, "Nome muito longo."),
  role: z
    .string()
    .min(10, "Papel deve ter ao menos 10 caracteres.")
    .max(500, "Papel muito longo."),
  goal: z
    .string()
    .min(10, "Objetivo deve ter ao menos 10 caracteres.")
    .max(1000, "Objetivo muito longo."),
  backstory: z
    .string()
    .max(2000, "Backstory muito longo.")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  toolNames: z.array(z.string()).optional().default([]),
});

export type PersonaTemplateFormData = z.infer<typeof personaTemplateFormSchema>;

interface PersonaTemplateFormProps {
  template?: PersonaTemplate;
  onSubmit: (formData: PersonaTemplateFormData) => Promise<void>;
  onSuccess?: (data: PersonaTemplate) => void;
  initialValues?: Partial<PersonaTemplateFormData>;
  isSubmitting: boolean;
  submitButtonText?: string;
}

export function PersonaTemplateForm({
  template,
  onSuccess,
  initialValues,
  isSubmitting,
  submitButtonText,
}: PersonaTemplateFormProps) {
  const router = useRouter();
  const isEditing = !!template;

  const form = useForm<PersonaTemplateFormData>({
    resolver: zodResolver(personaTemplateFormSchema),
    defaultValues: initialValues || (template ? {
      id: template.id as string | undefined, // Explicitly cast to string | undefined
      name: template.name,
      role: template.role,
      goal: template.goal,
      backstory: template.backstory,
      toolNames: template.toolNames || [], // Ensure toolNames is always an array
    } : {
      name: "",
      role: "",
      goal: "",
      backstory: "",
      toolNames: [],
    }),
  });

  const { currentToolInput, setCurrentToolInput, handleAddTool, handleRemoveTool } = usePersonaToolManagement(form);

  const createTemplateMutation = useIpcMutation<
    CreatePersonaTemplateRequest,
    CreatePersonaTemplateResponseData
  >(IPC_CHANNELS.CREATE_PERSONA_TEMPLATE, {
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success(`Template "${response.data.name}" criado com sucesso!`);
        onSuccess?.(response.data);
        router.navigate({
          to: "/app/personas/$templateId",
          params: { templateId: response.data.id },
        });
      } else {
        toast.error(response.error?.message || "Falha ao criar o template.");
      }
    },
    onError: (error) => {
      toast.error(`Erro ao criar template: ${error.message}`);
    },
  });

  const updateTemplateMutation = useIpcMutation<
    UpdatePersonaTemplateRequest,
    UpdatePersonaTemplateResponseData
  >(IPC_CHANNELS.UPDATE_PERSONA_TEMPLATE, {
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success(
          `Template "${response.data.name}" atualizado com sucesso!`,
        );
        onSuccess?.(response.data);
        router.invalidate();
      } else {
        toast.error(response.error?.message || "Falha ao atualizar o template.");
      }
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar template: ${error.message}`);
    },
  });

  const effectiveIsSubmitting =
    isSubmitting || createTemplateMutation.isLoading || updateTemplateMutation.isLoading;

  const effectiveHandleSubmit = (data: PersonaTemplateFormData) => {
    if (isEditing && template) {
      updateTemplateMutation.mutate({ templateId: template.id, data: data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const effectiveSubmitButtonText = submitButtonText || (isEditing
    ? "Atualizar Template"
    : "Salvar Template");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(effectiveHandleSubmit)} className="space-y-6">
        <PersonaNameField control={form.control} />
        <PersonaRoleField control={form.control} />
        <PersonaGoalField control={form.control} />
        <PersonaBackstoryField control={form.control} />
        <PersonaToolsField
          control={form.control}
          currentToolInput={currentToolInput}
          setCurrentToolInput={setCurrentToolInput}
          handleAddTool={handleAddTool}
          handleRemoveTool={handleRemoveTool}
        />

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={effectiveIsSubmitting || (isEditing && !form.formState.isDirty)}
          >
            {effectiveIsSubmitting ? "Salvando Template..." : effectiveSubmitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}