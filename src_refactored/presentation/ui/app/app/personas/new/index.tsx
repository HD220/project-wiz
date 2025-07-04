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
  PersonaTemplateFormData,
} from "@/ui/features/persona/components/PersonaTemplateForm";
import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  CreatePersonaTemplateRequest,
  CreatePersonaTemplateResponseData,
  IPCResponse,
} from "@/shared/ipc-types";

function NewPersonaTemplatePage() {
  const router = useRouter();

  const createPersonaMutation = useIpcMutation<
    IPCResponse<CreatePersonaTemplateResponseData>,
    CreatePersonaTemplateRequest
  >(IPC_CHANNELS.CREATE_PERSONA_TEMPLATE, {
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success(
          `Template de Persona "${response.data.name}" criado com sucesso!`
        );
        router.navigate({
          to: "/app/personas/$templateId",
          params: { templateId: response.data.id },
          replace: true,
        });
      } else {
        toast.error(
          `Falha ao criar o template: ${response.error?.message || "Erro desconhecido."}`
        );
      }
    },
    onError: (error: Error) => {
      toast.error(`Falha ao criar o template: ${error.message}`);
    },
  });

  const handleSubmit = async (data: PersonaTemplateFormData) => {
    console.log("Dados do novo template de persona:", data);
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
            isSubmitting={createPersonaMutation.isLoading}
            // submitButtonText is handled by PersonaTemplateForm default
          />
        </CardContent>
      </Card>
      <Button
        variant="link"
        onClick={() => router.history.back()}
        className="mt-4"
        disabled={createPersonaMutation.isLoading}
      >
        Cancelar e Voltar
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/app/personas/new/")({
  component: NewPersonaTemplatePage,
});
