import { createFileRoute, useRouter, useParams, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { LLMConfigForm, LLMConfigFormData } from '@/presentation/ui/features/llm/components/LLMConfigForm';
import { LLMConfig } from '@/presentation/ui/features/llm/components/LLMConfigList'; // For mock data type

// Simulating a "database" of LLM configurations
// In a real app, this would be fetched and updated via IPC/API
let mockLlmConfigsDb: Record<string, LLMConfig> = {
  'configId1': { id: '1', name: 'OpenAI Pessoal', providerId: 'openai', baseUrl: 'https://api.openai.com/v1', apiKey: 'sk-...' },
  'configId2': { id: '2', name: 'Ollama Local (Llama3)', providerId: 'ollama', baseUrl: 'http://localhost:11434' },
  'configId3': { id: '3', name: 'DeepSeek Trabalho', providerId: 'deepseek', apiKey: 'dk-...' },
};

function EditLLMConfigPage() {
  const router = useRouter();
  const params = useParams({ from: '/(app)/settings/llm/$configId/edit/' });
  const configId = params.configId;

  const [initialValues, setInitialValues] = useState<Partial<LLMConfigFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configName, setConfigName] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching config data
    setTimeout(() => {
      // Find by string ID from mock, as configId from URL is string
      const foundConfig = Object.values(mockLlmConfigsDb).find(c => c.id === configId);

      if (foundConfig) {
        setInitialValues({
          name: foundConfig.name,
          providerId: foundConfig.providerId as LLMConfigFormData['providerId'], // Cast if necessary
          apiKey: (foundConfig as any).apiKey || '', // apiKey might not be on LLMConfig type for list
          baseUrl: foundConfig.baseUrl || '',
        });
        setConfigName(foundConfig.name);
      } else {
        toast.error(`Configuração LLM com ID "${configId}" não encontrada.`);
      }
      setIsLoading(false);
    }, 300);
  }, [configId]);

  const handleSubmit = async (data: LLMConfigFormData) => {
    setIsSubmitting(true);
    console.log('Dados atualizados da configuração LLM:', configId, data);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const configToUpdate = Object.values(mockLlmConfigsDb).find(c => c.id === configId);

    if (configToUpdate) {
      // Update the "DB" entry; find the actual key of the object to update
      const dbKey = Object.keys(mockLlmConfigsDb).find(key => mockLlmConfigsDb[key].id === configId);
      if(dbKey) {
        mockLlmConfigsDb[dbKey] = {
            ...mockLlmConfigsDb[dbKey],
            ...data,
            id: configId // ensure id remains the same
        };
      }
      setConfigName(data.name);
      toast.success(`Configuração LLM "${data.name}" atualizada com sucesso (simulado)!`);
      router.navigate({ to: '/settings/llm', replace: true });
    } else {
      toast.error("Falha ao encontrar a configuração para atualizar.");
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando dados da configuração LLM para edição...</div>;
  }

  if (!initialValues) {
    return (
      <div className="p-8 text-center">
        <p>Configuração LLM não encontrada.</p>
         <Button variant="outline" className="mt-4" asChild>
            <Link to="/settings/llm"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Configs LLM</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link to="/settings/llm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Configs LLM
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Configuração LLM: {configName}</CardTitle>
          <CardDescription>
            Modifique os detalhes desta configuração de Provedor LLM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LLMConfigForm
            onSubmit={handleSubmit}
            initialValues={initialValues}
            isSubmitting={isSubmitting}
            // submitButtonText is handled by LLMConfigForm based on initialValues
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/(app)/settings/llm/$configId/edit/')({
  component: EditLLMConfigPage,
});
