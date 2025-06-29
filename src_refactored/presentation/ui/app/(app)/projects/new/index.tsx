import { createFileRoute, useRouter } from '@tanstack/react-router';
import React from 'react';
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { ProjectForm, ProjectFormData } from '@/presentation/ui/features/project/components/ProjectForm';
// import { useIPC } from '@/presentation/ui/hooks/useIPC'; // Uncomment when IPC is ready

function NewProjectPage() {
  const router = useRouter();
  // const ipc = useIPC(); // Uncomment when IPC is ready
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    console.log('Dados do novo projeto:', data);

    // Simulação de chamada IPC
    // const result = await ipc.invoke('project:create', data);
    // if (result.success && result.data) {
    //   toast.success(`Projeto "${data.name}" criado com sucesso!`);
    //   router.navigate({ to: '/projects/$projectId', params: { projectId: result.data.id }, replace: true });
    // } else {
    //   toast.error(`Falha ao criar o projeto: ${result.error?.message || 'Erro desconhecido'}`);
    //   setIsSubmitting(false);
    // }

    // Simulação de sucesso após um breve delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Projeto "${data.name}" criado com sucesso (simulado)!`);
    // Navegar para a lista de projetos ou para o projeto recém-criado (se tiver ID)
    // Por enquanto, apenas para a lista.
    router.navigate({ to: '/projects', replace: true });
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Criar Novo Projeto</CardTitle>
          <CardDescription>
            Forneça os detalhes abaixo para iniciar um novo projeto de software.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            // initialValues can be used for an edit form, not needed here
          />
        </CardContent>
      </Card>
       <Button variant="link" onClick={() => router.history.back()} className="mt-4">
        Cancelar e Voltar
      </Button>
    </div>
  );
}

export const Route = createFileRoute('/(app)/projects/new/')({
  component: NewProjectPage,
});
