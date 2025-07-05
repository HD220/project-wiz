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
  if (!personaTemplate || !personaTemplate.success || !personaTemplate.data) {
    return (
      <div className="p-8 text-center">
        <p>
          Template de Persona com ID &quot;{templateId}&quot; não encontrado.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/app/personas">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Personas
          </Link>
        </Button>
      </div>
    );
  }

  const initialValues: Partial<PersonaTemplateFormData> = {
    id: personaTemplate.data.id,
    name: personaTemplate.data.name,
    role: personaTemplate.data.role,
    goal: personaTemplate.data.goal,
    backstory: personaTemplate.data.backstory,
    toolNames: personaTemplate.data.toolNames || [],
  };

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
            Editar Template de Persona: {personaTemplate.data.name}
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