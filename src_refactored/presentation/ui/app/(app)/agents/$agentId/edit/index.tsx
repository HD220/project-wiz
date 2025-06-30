import { createFileRoute, useRouter, useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Loader2, ServerCrash } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

// Internal - Shared
import { IPC_CHANNELS } from '@/shared/ipc-channels';

// Internal - Features, Hooks, Components (alphabetical within logical groups)
import { AgentInstanceForm, AgentInstanceFormData } from '@/presentation/ui/features/agent/components/AgentInstanceForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIpcMutation } from '@/presentation/ui/hooks/ipc/useIpcMutation';
import { useIpcQuery } from '@/presentation/ui/hooks/ipc/useIpcQuery';

// Type Imports
import type {
  GetPersonaTemplatesListResponseData,
  GetLLMConfigsListResponseData,
  GetAgentInstanceDetailsRequest,
  GetAgentInstanceDetailsResponseData,
  UpdateAgentInstanceRequest,
  UpdateAgentInstanceResponseData,
  IPCResponse,
  PersonaTemplate,
  LLMConfig
} from '@/shared/ipc-types';

// Helper component for loading/error states
interface DataLoadingOrErrorDisplayProps {
  isLoadingAll: boolean;
  anyError: Error | null | undefined;
  agentError?: Error | null;
  personasError?: Error | null;
  llmsError?: Error | null;
  router: ReturnType<typeof useRouter>;
}

function DataLoadingOrErrorDisplay({ isLoadingAll, anyError, agentError, personasError, llmsError, router }: DataLoadingOrErrorDisplayProps) {
  if (isLoadingAll) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-400">Carregando dados para edição...</p>
      </div>
    );
  }

  if (anyError) {
    const errorMessages = [];
    if (agentError) errorMessages.push(`Detalhes do Agente: ${agentError.message}`);
    if (personasError) errorMessages.push(`Templates de Persona: ${personasError.message}`);
    if (llmsError) errorMessages.push(`Configurações LLM: ${llmsError.message}`);
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] bg-red-50 dark:bg-red-900/10 rounded-lg">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Falha ao carregar dados</h2>
        <div className="text-sm text-red-600 dark:text-red-400 mb-4 space-y-1">
          {errorMessages.map((msg, idx) => <p key={idx}>{msg}</p>)}
        </div>
        <Button onClick={() => router.history.back()} variant="destructive" className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }
  return null;
}

// Helper component to render the form
interface EditAgentFormRendererProps {
  agentId: string;
  agentInstance: GetAgentInstanceDetailsResponseData;
  personaTemplates: GetPersonaTemplatesListResponseData | null | undefined;
  llmConfigs: GetLLMConfigsListResponseData | null | undefined;
  handleSubmit: (formData: AgentInstanceFormData) => Promise<void>;
  isSubmitting: boolean;
}

function EditAgentFormRenderer({
  agentId,
  agentInstance,
  personaTemplates,
  llmConfigs,
  handleSubmit,
  isSubmitting,
}: EditAgentFormRendererProps) {
  if (!agentInstance) {
    // Should not happen if DataLoadingOrErrorDisplay is used before this
    return (
      <div className="p-8 text-center">
        <p>Instância de Agente não encontrada.</p>
         <Button variant="outline" className="mt-4" asChild>
            <Link to="/agents"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Agentes</Link>
        </Button>
      </div>
    );
  }

  const initialValues: Partial<AgentInstanceFormData> = {
    agentName: agentInstance.agentName,
    personaTemplateId: agentInstance.personaTemplateId,
    llmProviderConfigId: agentInstance.llmProviderConfigId,
    temperature: agentInstance.temperature,
  };
  const agentDisplayName = agentInstance.agentName || `Agente (ID: ${agentInstance.id.substring(0,6)})`;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link to="/agents/$agentId" params={{ agentId }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes do Agente
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Instância de Agente: {agentDisplayName}</CardTitle>
          <CardDescription>
            Modifique a configuração desta instância de Agente IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentInstanceForm
            onSubmit={handleSubmit}
            initialValues={initialValues}
            isSubmitting={isSubmitting}
            personaTemplates={(personaTemplates || []) as Pick<PersonaTemplate, 'id' | 'name'>[]}
            llmConfigs={(llmConfigs || []) as Pick<LLMConfig, 'id' | 'name' | 'providerId'>[]}
          />
        </CardContent>
      </Card>
    </div>
  );
}


function EditAgentInstancePage() {
  const router = useRouter();
  const params = useParams({ from: '/(app)/agents/$agentId/edit/' });
  const agentId = params.agentId;

  // Query for existing Agent Instance data
  const { data: agentInstance, isLoading: isLoadingAgent, error: agentError, refetch: refetchAgent } = useIpcQuery<
    GetAgentInstanceDetailsRequest,
    GetAgentInstanceDetailsResponseData
  >(IPC_CHANNELS.GET_AGENT_INSTANCE_DETAILS, { agentId }, { staleTime: 5 * 60 * 1000 });

  // Query for Persona Templates list
  const { data: personaTemplates, isLoading: isLoadingPersonas, error: personasError } = useIpcQuery<
    null, GetPersonaTemplatesListResponseData
  >(IPC_CHANNELS.GET_PERSONA_TEMPLATES_LIST, null, { staleTime: 15 * 60 * 1000 });

  // Query for LLM Configs list
  const { data: llmConfigs, isLoading: isLoadingLLMs, error: llmsError } = useIpcQuery<
    null, GetLLMConfigsListResponseData
  >(IPC_CHANNELS.GET_LLM_CONFIGS_LIST, null, { staleTime: 15 * 60 * 1000 });


  const updateAgentMutation = useIpcMutation<
    UpdateAgentInstanceRequest,
    IPCResponse<UpdateAgentInstanceResponseData>
  >(
    IPC_CHANNELS.UPDATE_AGENT_INSTANCE,
    {
      onSuccess: (response): void => {
        if (response.success && response.data) {
          const agentDisplayName = response.data.agentName || `Agente (ID: ${response.data.id.substring(0,6)})`;
          toast.success(`Instância de Agente "${agentDisplayName}" atualizada com sucesso!`);
          refetchAgent();
          // Refetch agent details
          // Navigate back to the agent's detail page
          router.navigate({ to: '/agents/$agentId', params: { agentId: response.data.id }, replace: true });
        } else {
          toast.error(`Falha ao atualizar a instância: ${response.error?.message || 'Erro desconhecido.'}`);
        }
      },
      onError: (error) => {
        toast.error(`Falha ao atualizar a instância: ${error.message}`);
      },
    }
  );

  const handleSubmit = async (formData: AgentInstanceFormData): Promise<void> => {
    console.log('Dados atualizados da instância de agente:', agentId, formData);
    updateAgentMutation.mutate({ agentId, data: formData });
  };

  const isLoadingAll = isLoadingAgent || isLoadingPersonas || isLoadingLLMs;
  const anyError = agentError || personasError || llmsError;

  const loadingOrErrorDisplay = DataLoadingOrErrorDisplay({
    isLoadingAll,
    anyError,
    agentError,
    personasError,
    llmsError,
    router
  });

  if (loadingOrErrorDisplay) {
    return loadingOrErrorDisplay;
  }

  // AgentInstance should be available here due to the checks in DataLoadingOrErrorDisplay
  // and the subsequent !agentInstance check if DataLoadingOrErrorDisplay returns null (meaning no error and not loading)
  if (!agentInstance) {
     // This case implies isLoadingAll is false and anyError is false, but agentInstance is still null.
     // This could happen if GET_AGENT_INSTANCE_DETAILS returns success:true, data:null
    return (
      <div className="p-8 text-center">
        <ServerCrash className="h-12 w-12 text-slate-500 dark:text-slate-400 mb-4" />
        <p className="text-lg">Instância de Agente com ID &quot;{agentId}&quot; não encontrada.</p>
         <Button variant="outline" className="mt-4" asChild>
            <Link to="/agents"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Agentes</Link>
        </Button>
      </div>
    );
  }

  return (
    <EditAgentFormRenderer
      agentId={agentId}
      agentInstance={agentInstance}
      personaTemplates={personaTemplates}
      llmConfigs={llmConfigs}
      handleSubmit={handleSubmit}
      isSubmitting={updateAgentMutation.isLoading}
    />
  );
}

export const Route = createFileRoute('/(app)/agents/$agentId/edit/')({
  component: EditAgentInstancePage,
});
