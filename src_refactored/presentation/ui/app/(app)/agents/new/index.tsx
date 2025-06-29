import { createFileRoute, useRouter } from '@tanstack/react-router';
import React from 'react';
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { AgentInstanceForm, AgentInstanceFormData } from '@/presentation/ui/features/agent/components/AgentInstanceForm';
// import { useIPC } from '@/presentation/ui/hooks/useIPC'; // Uncomment when IPC is ready

// Mock data for selections in the form (would typically come from API/store)
import { LLMConfig } from '@/presentation/ui/features/llm/components/LLMConfigList';
import { PersonaTemplate } from '@/presentation/ui/features/persona/components/PersonaTemplateListItem';

const mockPersonaTemplates: Pick<PersonaTemplate, 'id' | 'name'>[] = [
  { id: '1', name: 'Engenheiro de Software Sênior' },
  { id: '2', name: 'Analista de QA Detalhista' },
  { id: '3', name: 'Gerente de Projetos Ágil' },
];

const mockLlmConfigs: Pick<LLMConfig, 'id' | 'name' | 'providerId'>[] = [
  { id: '1', name: 'OpenAI Pessoal', providerId: 'openai' },
  { id: '2', name: 'Ollama Local (Llama3)', providerId: 'ollama' },
  { id: '3', name: 'DeepSeek Trabalho', providerId: 'deepseek' },
];


function NewAgentInstancePage() {
  const router = useRouter();
  // const ipc = useIPC(); // Uncomment when IPC is ready
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: AgentInstanceFormData) => {
    setIsSubmitting(true);
    console.log('Dados da nova instância de agente:', data);

    // Simulação de chamada IPC
    // const result = await ipc.invoke('agent:create-instance', data);
    // if (result.success && result.data) {
    //   toast.success(`Instância de Agente "${data.agentName || 'Agente'}" criada com sucesso!`);
    //   router.navigate({ to: '/agents', replace: true });
    // } else {
    //   toast.error(`Falha ao criar a instância: ${result.error?.message || 'Erro desconhecido'}`);
    //   setIsSubmitting(false);
    // }

    // Simulação de sucesso
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Instância de Agente "${data.agentName || `Agente (Persona: ${mockPersonaTemplates.find(persona => persona.id === data.personaTemplateId)?.name})`}" criada com sucesso (simulado)!`); // p to persona
    router.navigate({ to: '/agents', replace: true });
    setIsSubmitting(false);
  };

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
            isSubmitting={isSubmitting}
            personaTemplates={mockPersonaTemplates}
            llmConfigs={mockLlmConfigs}
          />
        </CardContent>
      </Card>
      <Button variant="link" onClick={() => router.history.back()} className="mt-4">
        Cancelar e Voltar
      </Button>
    </div>
  );
}

export const Route = createFileRoute('/(app)/agents/new/')({
  component: NewAgentInstancePage,
});
