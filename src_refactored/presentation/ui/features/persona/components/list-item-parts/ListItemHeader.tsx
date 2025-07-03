import { Link } from '@tanstack/react-router';
import {
  UserSquare,
  Edit3,
  Trash2,
  MoreVertical,
  Zap,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { PersonaTemplate } from '../PersonaTemplateListItem';

interface ListItemHeaderProps {
  template: PersonaTemplate;
  onEdit?: (templateId: string) => void;
  onDelete?: (templateId: string) => void;
  onCreateAgent?: (templateId: string) => void;
}

export function ListItemHeader({
  template,
  onEdit,
  onDelete,
  onCreateAgent,
}: ListItemHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between mb-2">
        <UserSquare className="h-10 w-10 text-sky-500 dark:text-sky-400" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Mais opções</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onCreateAgent && (
              <DropdownMenuItem onClick={() => onCreateAgent(template.id)}>
                <Zap className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Criar Agente com este Template
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(template.id)}>
                <Edit3 className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Editar Template
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-500 focus:text-red-600 dark:focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50"
                  onClick={() => onDelete(template.id)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Excluir Template
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardTitle className="text-lg truncate" title={template.name}>
        <Link
          to="/personas/$templateId"
          params={{ templateId: template.id }}
          className="hover:underline"
        >
          {template.name}
        </Link>
      </CardTitle>
      <CardDescription
        className="text-xs h-10 line-clamp-2"
        title={template.role}
      >
        Papel: {template.role}
      </CardDescription>
    </CardHeader>
  );
}
