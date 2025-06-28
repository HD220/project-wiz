import { createFileRoute, useRouter, useParams, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { PersonaTemplateForm, PersonaTemplateFormData } from '@/presentation/ui/features/persona/components/PersonaTemplateForm';
import { PersonaTemplate } from '@/presentation/ui/features/persona/components/PersonaTemplateListItem';

// Reutilizando o mock, em um cenário real, buscaríamos apenas o template específico
const mockPersonaTemplates: Record<string, PersonaTemplate> = {
  templateId1: { id: '1', name: 'Engenheiro de Software Sênior', role: 'Desenvolvedor especialista em arquiteturas complexas e refatoração de código.', goal: 'Escrever código limpo, eficiente, bem documentado e testado. Mentorar desenvolvedores juniores.', backstory: '15 anos de experiência...', toolNames: ['filesystem', 'terminal', 'codeEditor'] },
  templateId2: { id: '2', name: 'Analista de QA Detalhista', role: 'Especialista em testes de software...', goal: 'Garantir qualidade...', toolNames: ['testRunner', 'issueTracker'] },
  templateId3: { id: '3', name: 'Gerente de Projetos Ágil', role: 'Facilitador de equipes ágeis...', goal: 'Manter o projeto nos trilhos...', toolNames: ['taskManager'] },
};

function EditPersonaTemplatePage() {
  const router = useRouter();
  const params = useParams({ from: '/(app)/personas/$templateId/edit/' });
  const templateId = params.templateId;

  const [initialValues, setInitialValues] = useState<Partial<PersonaTemplateFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateName, setTemplateName] = useState<string>('');


  useEffect(() => {
    setIsLoading(true);
    // Simular busca do template
    setTimeout(() => {
      const foundTemplate = mockPersonaTemplates[templateId];
      if (foundTemplate) {
        setInitialValues({
          name: foundTemplate.name,
          role: foundTemplate.role,
          goal: foundTemplate.goal,
          backstory: foundTemplate.backstory,
          toolNames: foundTemplate.toolNames || [],
        });
        setTemplateName(foundTemplate.name);
      } else {
        toast.error(`Template de Persona com ID "${templateId}" não encontrado.`);
        // router.navigate({ to: '/personas' }); // Opcional: redirecionar se não encontrado
      }
      setIsLoading(false);
    }, 300);
  }, [templateId, router]);

  const handleSubmit = async (data: PersonaTemplateFormData) => {
    setIsSubmitting(true);
    console.log('Dados atualizados do template de persona:', templateId, data);

    // Simular chamada IPC para atualizar
    // const result = await ipc.invoke('persona:update-template', { id: templateId, ...data });
    // if (result.success) {
    //   toast.success(`Template "${data.name}" atualizado com sucesso!`);
    //   router.navigate({ to: '/personas/$templateId', params: { templateId }, replace: true });
    // } else {
    //   toast.error(`Falha ao atualizar o template: ${result.error?.message || 'Erro desconhecido'}`);
    // }

    await new Promise(resolve => setTimeout(resolve, 1000));
    // Atualizar mock localmente para demonstração
     if (mockPersonaTemplates[templateId]) {
        mockPersonaTemplates[templateId] = { ...mockPersonaTemplates[templateId], ...data };
        setTemplateName(data.name); // Atualiza o nome no título se ele mudar
    }
    toast.success(`Template "${data.name}" atualizado com sucesso (simulado)!`);
    router.navigate({ to: '/personas/$templateId', params: { templateId }, replace: true });

    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando dados do template para edição...</div>;
  }

  if (!initialValues) {
    return (
      <div className="p-8 text-center">
        <p>Template não encontrado.</p>
         <Button variant="outline" className="mt-4" asChild>
            <Link to="/personas"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
       <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link to="/personas/$templateId" params={{templateId}}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes
          </Link>
        </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Template de Persona: {templateName}</CardTitle>
          <CardDescription>
            Modifique as características base deste template de Agente IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonaTemplateForm
            onSubmit={handleSubmit}
            initialValues={initialValues}
            isSubmitting={isSubmitting}
            submitButtonText="Salvar Alterações"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/(app)/personas/$templateId/edit')({
  component: EditPersonaTemplatePage,
});
