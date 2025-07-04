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
import {
  PersonaTemplateForm,
  PersonaTemplateFormData,
} from "@/ui/features/persona/components/PersonaTemplateForm";

import type {
  GetPersonaTemplateDetailsResponseData,
} from "@/shared/ipc-types";

interface EditPersonaTemplateFormRendererProps {
  templateId: string;
  personaTemplate: GetPersonaTemplateDetailsResponseData;
  handleSubmit: (formData: PersonaTemplateFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function EditPersonaTemplateFormRenderer({
  templateId,
  personaTemplate,
  handleSubmit,
  isSubmitting,
}: EditPersonaTemplateFormRendererProps) {
  if (!personaTemplate) {
    return null;
  }

  const initialValues: Partial<PersonaTemplateFormData> = {
    name: personaTemplate.name,
    role: personaTemplate.role,
    goal: personaTemplate.goal,
    backstory: personaTemplate.backstory,
    toolNames: personaTemplate.toolNames || [],
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link to="/personas/$templateId" params={{ templateId }}>
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
            onSubmit={handleSubmit}
            initialValues={initialValues}
            isSubmitting={isSubmitting}
            submitButtonText="Salvar Alterações"
          />
        </CardContent>
      </Card>
    </div>
  );
}
