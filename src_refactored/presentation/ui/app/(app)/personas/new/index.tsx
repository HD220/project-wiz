import { createFileRoute, useRouter } from '@tanstack/react-router';
import React from 'react';
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { PersonaTemplateForm, PersonaTemplateFormData } from '@/presentation/ui/features/persona/components/PersonaTemplateForm';
// import { useIPC } from '@/presentation/ui/hooks/useIPC'; // Uncomment when IPC is ready

function NewPersonaTemplatePage() {
  const router = useRouter();
  // const ipc = useIPC(); // Uncomment when IPC is ready
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: PersonaTemplateFormData) => {
    setIsSubmitting(true);
    console.log('Dados do novo template de persona:', data);

    // Simulação de chamada IPC
    // const result = await ipc.invoke('persona:create-template', data);
    // if (result.success && result.data) {
    //   toast.success(`Template de Persona "${data.name}" criado com sucesso!`);
    //   router.navigate({ to: '/personas', replace: true });
    // } else {
    //   toast.error(`Falha ao criar o template: ${result.error?.message || 'Erro desconhecido'}`);
    //   setIsSubmitting(false);
    // }

    // Simulação de sucesso após um breve delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Template de Persona "${data.name}" criado com sucesso (simulado)!`);
    router.navigate({ to: '/personas', replace: true });
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto"> {/* Increased max-width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Criar Novo Template de Persona</CardTitle>
          <CardDescription>
            Defina as características base para um novo tipo de Agente IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonaTemplateForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
      <Button variant="link" onClick={() => router.history.back()} className="mt-4">
        Cancelar e Voltar
      </Button>
    </div>
  );
}

export const Route = createFileRoute('/(app)/personas/new/')({
  component: NewPersonaTemplatePage,
});
