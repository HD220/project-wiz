import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Loader2, ServerCrash } from 'lucide-react';
import React from 'react'; // Removed useState
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { AgentInstanceForm, AgentInstanceFormData } from '@/presentation/ui/features/agent/components/AgentInstanceForm';
import { useIpcMutation } from '@/presentation/ui/hooks/ipc/useIpcMutation';
import { useIpcQuery } from '@/presentation/ui/hooks/ipc/useIpcQuery';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type {
  GetPersonaTemplatesListResponseData,
  GetLLMConfigsListResponseData,
  CreateAgentInstanceRequest, // This is AgentInstanceFormData
  CreateAgentInstanceResponseData,
  IPCResponse,
  PersonaTemplate, // Ensure these types are available for the form props
  LLMConfig
} from '@/shared/ipc-types';


function NewAgentInstancePage() {
  const router = useRouter();

  const { data: personaTemplates, isLoading: isLoadingPersonas, error: personasError } = useIpcQuery<
    null, // No request args for list
    GetPersonaTemplatesListResponseData
  >(IPC_CHANNELS.GET_PERSONA_TEMPLATES_LIST, null, { staleTime: 5 * 60 * 1000 });

  const { data: llmConfigs, isLoading: isLoadingLLMConfigs, error: llmConfigsError } = useIpcQuery<
    null, // No request args for list
    GetLLMConfigsListResponseData
  >(IPC_CHANNELS.GET_LLM_CONFIGS_LIST, null, { staleTime: 5 * 60 * 1000 });

  const createAgentMutation = useIpcMutation<
    CreateAgentInstanceRequest,
    IPCResponse<CreateAgentInstanceResponseData>
  >(
    IPC_CHANNELS.CREATE_AGENT_INSTANCE,
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          const agentDisplayName = response.data.agentName || `Agente (ID: ${response.data.id.substring(0,6)})`;
          toast.success(`Instância de Agente "${agentDisplayName}" criada com sucesso!`);
          router.navigate({ to: '/agents/$agentId', params: { agentId: response.data.id }, replace: true });
        } else {
          toast.error(`Falha ao criar a instância: ${response.error?.message || 'Erro desconhecido.'}`);
        }
      },
      onError: (error) => {
        toast.error(`Falha ao criar a instância: ${error.message}`);
      },
    }
  );

  const handleSubmit = async (data: AgentInstanceFormData) => {
    console.log('Dados da nova instância de agente:', data);
    createAgentMutation.mutate(data);
  };

  const isLoadingDependencies = isLoadingPersonas || isLoadingLLMConfigs;
  const dependencyError = personasError || llmConfigsError;

  if (isLoadingDependencies) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-400">Carregando dependências do formulário...</p>
      </div>
    );
  }

  if (dependencyError) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] bg-red-50 dark:bg-red-900/10 rounded-lg">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Falha ao carregar dados para o formulário</h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          {personasError?.message && `Personas: ${personasError.message}`}
          {llmConfigsError?.message && `LLMs: ${llmConfigsError.message}`}
        </p>
        <Button onClick={() => router.history.back()} variant="destructive" className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Criar Nova Instância de Agente</CardTitle>
          <CardDescription>
            Configure um novo Agente IA selecionando um Template de Persona e uma Configuração LLM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentInstanceForm
            onSubmit={handleSubmit}
            isSubmitting={createAgentMutation.isLoading}
            // Provide Pick<...> types if AgentInstanceForm expects specific subsets
            personaTemplates={(personaTemplates || []) as Pick<PersonaTemplate, 'id' | 'name'>[]}
            llmConfigs={(llmConfigs || []) as Pick<LLMConfig, 'id' | 'name' | 'providerId'>[]}
          />
        </CardContent>
      </Card>
      <Button variant="link" onClick={() => router.history.back()} className="mt-4" disabled={createAgentMutation.isLoading}>
        Cancelar e Voltar
      </Button>
    </div>
  );
}

export const Route = createFileRoute('/(app)/agents/new/')({
  component: NewAgentInstancePage,
});
