import React from 'react';

import { CardContent } from '@/components/ui/card';

import { PersonaTemplate } from '../PersonaTemplateListItem';

import { ListItemTools } from './ListItemTools';

interface ListItemContentProps {
  template: PersonaTemplate;
}

export function ListItemContent({ template }: ListItemContentProps) {
  return (
    <CardContent className="flex-grow pb-3 space-y-2">
      <div>
        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
          Objetivo Principal:
        </h4>
        <p
          className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3"
          title={template.goal}
        >
          {template.goal}
        </p>
      </div>
      <ListItemTools toolNames={template.toolNames || []} />
    </CardContent>
  );
}
