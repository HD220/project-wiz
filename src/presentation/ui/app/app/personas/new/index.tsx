import { createFileRoute, useRouter } from "@tanstack/react-router";
import React from "react";
import { toast } from "sonner";

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
  type PersonaTemplateFormData,
} from "@/ui/features/persona/components/PersonaTemplateForm";
import { useIpcMutation } from "@/ui/hooks/ipc/use-ipc-mutation.hook";

import { IPC_CHANNELS } from "@/shared/ipc-channels.constants";
import type {
  CreatePersonaTemplateRequest,
  CreatePersonaTemplateResponse,
} from "@/shared/ipc-types/persona.types";

function NewPersonaTemplatePage() {
  const router = useRouter();

  const createPersonaMutation = useIpcMutation<
    CreatePersonaTemplateResponse,
    CreatePersonaTemplateRequest
  >(IPC_CHANNELS.CREATE_PERSONA_TEMPLATE, {
    onSuccess: (data) => {
      toast.success(`Template de Persona "${data.name}" criado com sucesso!`);
      router.navigate({
        to: "/app/personas/$templateId",
        params: { templateId: data.id },
        replace: true,
      });
    },
    onError: (error) => {
      toast.error(`Falha ao criar o template: ${error.message}`);
    },
  });

  const handleSubmit = async (data: PersonaTemplateFormData) => {
    createPersonaMutation.mutate(data);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Criar Novo Template de Persona
          </CardTitle>
          <CardDescription>
            Defina as características base para um novo tipo de Agente IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonaTemplateForm
            onSubmit={handleSubmit}
            isSubmitting={createPersonaMutation.isPending}
            submitButtonText="Salvar Template"
          />
        </CardContent>
      </Card>
      <Button
        variant="link"
        onClick={() => router.history.back()}
        className="mt-4"
        disabled={createPersonaMutation.isPending}
      >
        Cancelar e Voltar
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/app/personas/new/")({
  component: NewPersonaTemplatePage,
});
