import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

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
  initialValues?: Partial<PersonaTemplateFormData>;
  onSubmit: SubmitHandler<PersonaTemplateFormData>;
  isSubmitting: boolean;
  submitButtonText: string;
}

export function PersonaTemplateForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitButtonText,
}: PersonaTemplateFormProps) {
  const form = useForm<PersonaTemplateFormData>({
    resolver: zodResolver(personaTemplateFormSchema),
    defaultValues: initialValues,
  });

  const {
    currentToolInput,
    setCurrentToolInput,
    handleAddTool,
    handleRemoveTool,
  } = usePersonaToolManagement(form);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            disabled={isSubmitting || !form.formState.isDirty}
          >
            {isSubmitting ? "Salvando Template..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
