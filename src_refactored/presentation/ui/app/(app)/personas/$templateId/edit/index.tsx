import { createFileRoute, useRouter, useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Loader2, ServerCrash } from 'lucide-react'; // Added Loader2, ServerCrash
import React from 'react'; // Removed useEffect, useState
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { PersonaTemplateForm, PersonaTemplateFormData } from '@/presentation/ui/features/persona/components/PersonaTemplateForm';
import { useIpcMutation } from '@/presentation/ui/hooks/ipc/useIpcMutation';
import { useIpcQuery } from '@/presentation/ui/hooks/ipc/useIpcQuery';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type {
  GetPersonaTemplateDetailsRequest,
  GetPersonaTemplateDetailsResponseData,
  UpdatePersonaTemplateRequest,
  UpdatePersonaTemplateResponseData,
  IPCResponse
} from '@/shared/ipc-types';


function EditPersonaTemplatePage() {
  const router = useRouter();
  const params = useParams({ from: '/(app)/personas/$templateId/edit/' });
  const templateId = params.templateId;

  const { data: personaTemplate, isLoading: isLoadingTemplate, error: templateError, refetch } = useIpcQuery<
    GetPersonaTemplateDetailsRequest,
    GetPersonaTemplateDetailsResponseData
  >(
    IPC_CHANNELS.GET_PERSONA_TEMPLATE_DETAILS,
    { templateId },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      onError: (err) => {
        toast.error(`Erro ao buscar detalhes do template: ${err.message}`);
      }
    }
  );

  const updatePersonaMutation = useIpcMutation<
    UpdatePersonaTemplateRequest,
    IPCResponse<UpdatePersonaTemplateResponseData>
  >(
    IPC_CHANNELS.UPDATE_PERSONA_TEMPLATE,
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          toast.success(`Template "${response.data.name}" atualizado com sucesso!`);
          refetch(); // Refetch to update initialValues and header name
          // Navigate back to the details page
          router.navigate({ to: '/personas/$templateId', params: { templateId: response.data.id }, replace: true });
        } else {
          toast.error(`Falha ao atualizar o template: ${response.error?.message || 'Erro desconhecido.'}`);
        }
      },
      onError: (error) => {
        toast.error(`Falha ao atualizar o template: ${error.message}`);
      },
    }
  );

  const handleSubmit = async (formData: PersonaTemplateFormData) => {
    console.log('Dados atualizados do template de persona:', templateId, formData);
    updatePersonaMutation.mutate({ templateId, data: formData });
  };

  if (isLoadingTemplate) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-400">Carregando dados do template...</p>
      </div>
    );
  }

  if (templateError) {
     return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] bg-red-50 dark:bg-red-900/10 rounded-lg">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Falha ao carregar template</h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{templateError.message}</p>
        <Button variant="outline" className="mt-4" asChild>
            <Link to="/personas"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista</Link>
        </Button>
      </div>
    );
  }

  if (!personaTemplate) {
    return (
      <div className="p-8 text-center">
        <p>Template de Persona não encontrado.</p>
         <Button variant="outline" className="mt-4" asChild>
            <Link to="/personas"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Personas</Link>
        </Button>
      </div>
    );
  }

  // Prepare initialValues for the form once personaTemplate data is available
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
          <Link to="/personas/$templateId" params={{templateId}}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes
          </Link>
        </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Template de Persona: {personaTemplate.name}</CardTitle>
          <CardDescription>
            Modifique as características base deste template de Agente IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonaTemplateForm
            onSubmit={handleSubmit}
            initialValues={initialValues}
            isSubmitting={updatePersonaMutation.isLoading}
            submitButtonText="Salvar Alterações"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/(app)/personas/$templateId/edit/')({
  component: EditPersonaTemplatePage,
});
