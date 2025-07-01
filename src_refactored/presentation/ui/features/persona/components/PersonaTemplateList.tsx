import React from 'react';
import { toast } from 'sonner';

import { PersonaTemplate, PersonaTemplateListItem } from './PersonaTemplateListItem';

interface PersonaTemplateListProps {
  templates: PersonaTemplate[];
}

export function PersonaTemplateList({ templates }: PersonaTemplateListProps) {

  const handleDeleteTemplate = (templateId: string) => {
    const currentTemplate = templates.find(template => template.id === templateId);
    toast.warning(`Exclusão do template "${currentTemplate?.name}" (simulado).`, {
      description: "Esta funcionalidade ainda não está conectada ao backend.",
    });
    // Example: setTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const handleEditTemplate = (templateId: string) => {
    const currentTemplate = templates.find(template => template.id === templateId);
    toast.info(`Edição do template "${currentTemplate?.name}" (simulado).`, {
      description: "Redirecionamento para formulário de edição (a ser implementado).",
    });
    // Example: router.navigate({ to: `/personas/${templateId}/edit` });
  };

  const handleCreateAgentFromTemplate = (templateId: string) => {
    const currentTemplate = templates.find(template => template.id === templateId);
    toast.info(`Criar agente com template "${currentTemplate?.name}" (simulado).`, {
      description: "Redirecionamento para formulário de criação de agente (a ser implementado).",
    });
    // Example: router.navigate({ to: `/agents/new?templateId=${templateId}` });
  };


  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((template) => (
        <PersonaTemplateListItem
          key={template.id}
          template={template}
          onDelete={handleDeleteTemplate}
          onEdit={handleEditTemplate}
          onCreateAgent={handleCreateAgentFromTemplate}
        />
      ))}
    </div>
  );
}
