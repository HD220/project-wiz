import { createFileRoute, useRouter } from '@tanstack/react-router';
import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { LLMConfigForm } from '@/presentation/ui/features/llm/components/LLMConfigForm';

// Define a type for the form data for clarity, aligning with what LLMConfigForm might expect
// This would typically be derived from a Zod schema used by the form.
export interface LLMConfigFormData {
  name: string;
  providerId: 'openai' | 'deepseek' | string; // Extend as more providers are added
  apiKey: string;
  baseUrl?: string;
}


function NewLLMConfigPage() {
  const router = useRouter();

  const handleSubmit = async (data: LLMConfigFormData) => {
    console.log('Form data submitted:', data);
    // Here, you would typically call an IPC service to save the configuration:
    // const ipc = useIPC(); // Assuming useIPC hook is available
    // const result = await ipc.invoke('llm:create-config', data);
    // if (result.success) {
    //   toast.success('LLM Configuration saved successfully!');
    //   router.navigate({ to: '/settings/llm', replace: true });
    // } else {
    //   toast.error(`Failed to save LLM Configuration: ${result.error?.message}`);
    // }
    alert(`Dados do formulário (simulado):\n${JSON.stringify(data, null, 2)}\n\nRedirecionando para a lista...`);
    // For now, simulate success and navigate back
    router.navigate({ to: '/settings/llm', replace: true });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Nova Configuração de Provedor LLM</CardTitle>
          <CardDescription>
            Adicione uma nova configuração para se conectar a um Modelo de Linguagem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LLMConfigForm
            onSubmit={handleSubmit}
            // Optional: Pass initialValues if needed for an edit form, or defaults
            // initialValues={{ providerId: 'openai' }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/(app)/settings/llm/new/')({
  component: NewLLMConfigPage,
});
