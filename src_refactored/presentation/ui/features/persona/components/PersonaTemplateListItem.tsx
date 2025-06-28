import { Link } from '@tanstack/react-router';
import { UserSquare, Edit3, Trash2, MoreVertical, Settings, Zap, Brain } from 'lucide-react'; // Added more icons
import React from 'react';

import { Badge } from '@/presentation/ui/components/ui/badge';
import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/ui/components/ui/dropdown-menu';
import { Separator } from '@/presentation/ui/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/presentation/ui/components/ui/tooltip';


export interface PersonaTemplate {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory?: string;
  toolNames?: string[]; // List of tool names this persona can use
}

interface PersonaTemplateListItemProps {
  template: PersonaTemplate;
  onEdit?: (templateId: string) => void;
  onDelete?: (templateId: string) => void;
  onCreateAgent?: (templateId: string) => void; // Action to create an agent from this template
}

// A simple map for tool icons (extend as needed)
const toolIconMap: Record<string, React.ElementType> = {
  filesystem: Settings, // Placeholder, actual icon might be FolderCog or similar
  terminal: Settings, // Placeholder, actual icon might be TerminalSquare
  'code-editor': Edit3,
  search: Settings, // Placeholder, actual icon might be SearchCode
  'test-runner': Zap,
  'issue-tracker': Settings, // Placeholder
  'browser-dev-tools': Settings, // Placeholder
  'task-manager': Settings, // Placeholder
  'gantt-chart': Settings, // Placeholder
  'communication-tools': MessageSquare, // Placeholder
  'markdown-editor': Edit3,
  'documentation-generator': BookText, // Placeholder
  'screenshot-tool': Settings, // Placeholder
  default: Brain, // Default icon for unknown tools
};


export function PersonaTemplateListItem({ template, onEdit, onDelete, onCreateAgent }: PersonaTemplateListItemProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <UserSquare className="h-10 w-10 text-sky-500 dark:text-sky-400" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800">
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
          <Link to="/personas/$templateId" params={{ templateId: template.id }} className="hover:underline">
            {template.name}
          </Link>
        </CardTitle>
        <CardDescription className="text-xs h-10 line-clamp-2" title={template.role}>
          Papel: {template.role}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-3 space-y-2">
        <div>
          <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Objetivo Principal:</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3" title={template.goal}>
            {template.goal}
          </p>
        </div>
        {template.toolNames && template.toolNames.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Ferramentas:</h4>
            <div className="flex flex-wrap gap-1.5">
              <TooltipProvider delayDuration={100}>
                {template.toolNames.slice(0, 5).map(toolName => {
                  const IconComponent = toolIconMap[toolName] || toolIconMap.default;
                  return (
                    <Tooltip key={toolName}>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                          <IconComponent className="h-3 w-3 mr-1 opacity-70" />
                          {toolName}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs p-1">
                        {toolName}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                {template.toolNames.length > 5 && (
                   <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                          +{template.toolNames.length - 5} mais
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs p-1">
                        {template.toolNames.slice(5).join(', ')}
                      </TooltipContent>
                    </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="p-3">
        <Button variant="outline" size="sm" className="w-full" asChild>
           <Link to="/personas/$templateId" params={{ templateId: template.id }}>
            Ver Detalhes / Editar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
