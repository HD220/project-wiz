import React from 'react';

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { ListItemContent } from './list-item-parts/ListItemContent';
import { ListItemFooter } from './list-item-parts/ListItemFooter';
import { ListItemHeader } from './list-item-parts/ListItemHeader';

export interface PersonaTemplate {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory?: string;
  toolNames?: string[];
}

interface PersonaTemplateListItemProps {
  template: PersonaTemplate;
  onEdit?: (templateId: string) => void;
  onDelete?: (templateId: string) => void;
  onCreateAgent?: (templateId: string) => void;
}

export function PersonaTemplateListItem({
  template,
  onEdit,
  onDelete,
  onCreateAgent,
}: PersonaTemplateListItemProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <ListItemHeader
        template={template}
        onEdit={onEdit}
        onDelete={onDelete}
        onCreateAgent={onCreateAgent}
      />
      <ListItemContent template={template} />
      <Separator />
      <ListItemFooter templateId={template.id} />
    </Card>
  );
}
