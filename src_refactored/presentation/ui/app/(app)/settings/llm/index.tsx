import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { PlusCircle } from 'lucide-react';
import React, { useState } from 'react'; // Removed useEffect
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // For real data fetching
import { toast } from 'sonner'; // For notifications

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/ui/components/ui/alert-dialog";
import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { LLMConfigList, LLMConfig } from '@/presentation/ui/features/llm/components/LLMConfigList'; // Assuming LLMConfig type is exported
// import { useIPC } from '@/presentation/ui/hooks/useIPC'; // For IPC calls


function LLMConfigurationPage() {
  const router = useRouter();
  // const ipc = useIPC(); // Uncomment when IPC is ready
  // const queryClient = useQueryClient(); // For TanStack Query

  const [llmConfigs, setLlmConfigs] = useState<LLMConfig[]>([
    // Mock data for UI development
    { id: '1', name: 'OpenAI Pessoal', providerId: 'openai', baseUrl: 'https://api.openai.com/v1' },
    { id: '2', name: 'Ollama Local (Llama3)', providerId: 'ollama', baseUrl: 'http://localhost:11434' },
    { id: '3', name: 'DeepSeek Trabalho', providerId: 'deepseek' },
  ]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<LLMConfig | null>(null);


  // TODO: Replace with actual data fetching using TanStack Query and IPC
  // const { data: fetchedConfigs, isLoading, error } = useQuery({
  //   queryKey: ['llmConfigs'],
  //   queryFn: async () => {
  //     const result = await ipc.invoke<{ configs: LLMConfig[] }>('llm:list-configs');
  //     if (result.success) return result.data?.configs || [];
  //     throw new Error(result.error?.message || 'Failed to fetch LLM configurations');
  //   },
  // });

  // useEffect(() => {
  //   if (fetchedConfigs) {
  //     setLlmConfigs(fetchedConfigs);
  //   }
  //   if (error) {
  //     toast.error(`Erro ao buscar configurações LLM: ${error.message}`);
  //   }
  // }, [fetchedConfigs, error]);


  const handleEdit = (configId: string) => {
    router.navigate({ to: '/settings/llm/$configId/edit', params: { configId } });
  };

  const handleDelete = (config: LLMConfig) => {
    setShowDeleteConfirm(config);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    // TODO: Implement actual deletion via IPC and TanStack Mutation
    // mutation.mutate(showDeleteConfirm.id, { ... });
    toast.success(`Configuração "${showDeleteConfirm.name}" excluída (simulado).`);
    setLlmConfigs(prev => prev.filter(config => config.id !== showDeleteConfirm.id)); // Optimistic update for UI
    setShowDeleteConfirm(null);
  };

  // if (isLoading) return <p>Carregando configurações...</p>;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-2xl">Configurações de Provedor LLM</CardTitle>
            <CardDescription>
              Gerencie suas conexões com Modelos de Linguagem (LLMs).
            </CardDescription>
          </div>
          <Button asChild size="sm">
            <Link to="/settings/llm/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Configuração
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {llmConfigs.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-50">Nenhuma configuração LLM</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece adicionando uma nova configuração de LLM.</p>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link to="/settings/llm/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Configuração
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <LLMConfigList
              configs={llmConfigs}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {showDeleteConfirm && (
        <AlertDialog open onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a configuração LLM "{showDeleteConfirm.name}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteConfirm(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

export const Route = createFileRoute('/(app)/settings/llm/')({
  component: LLMConfigurationPage,
});
