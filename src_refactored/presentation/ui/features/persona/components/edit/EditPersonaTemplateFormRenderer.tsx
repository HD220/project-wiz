import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PersonaTemplateForm, type PersonaTemplateFormData } from "@/ui/features/persona/components/PersonaTemplateForm";
import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";
import { toast } from "sonner";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type { GetPersonaTemplateDetailsResponse, UpdatePersonaTemplateRequest, UpdatePersonaTemplateResponse } from "@/shared/ipc-types/persona.types";
import type { PersonaTemplate } from "@/core/domain/entities/persona";

interface EditPersonaTemplateFormRendererProps {
  templateId: string;
  personaTemplate: GetPersonaTemplateDetailsResponse;
}

export function EditPersonaTemplateFormRenderer({
  templateId,
  personaTemplate,
}: EditPersonaTemplateFormRendererProps) {
  if (!personaTemplate) {
    return null;
  }

  const updateTemplateMutation = useIpcMutation<
    UpdatePersonaTemplateResponse,
    UpdatePersonaTemplateRequest
  >(IPC_CHANNELS.UPDATE_PERSONA_TEMPLATE, {
    onSuccess: (data) => {
      toast.success(`Template "${data.name}" atualizado com sucesso!`);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar template: ${error.message}`);
    },
  });

  const handleSubmit = async (formData: PersonaTemplateFormData) => {
    updateTemplateMutation.mutate({
      templateId: personaTemplate.id,
      data: formData as Partial<PersonaTemplate>,
    });
  };

  const isSubmitting = updateTemplateMutation.isPending;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link to="/app/personas/$templateId" params={{ templateId }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Editar Template de Persona: {personaTemplate.name}
          </CardTitle>
          <CardDescription>
            Modifique as características base deste template de Agente IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonaTemplateForm
            initialValues={personaTemplate}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Atualizar Template"
          />
        </CardContent>
      </Card>
    </div>
  );
}
