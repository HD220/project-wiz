
import { Link } from '@tanstack/react-router';
import {
  ChevronDown,
  Pause,
  Play,
  Settings,
  Trash2,
} from 'lucide-react';
import React from 'react';

import type { Project } from '@/core/domain/entities/project.entity';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { statusDetails } from '@/ui/features/project/misc/statusDetails';

interface ProjectDetailHeaderProps {
  project: Project;
}

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  const currentStatusDetail = statusDetails[project.status];

  return (
    <header className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {project.name}
          </h1>
          <div className="mt-1 flex items-center space-x-2">
            <currentStatusDetail.icon
              className={`h-4 w-4 ${currentStatusDetail.colorClass}`}
            />
            <span
              className={`text-xs font-medium ${currentStatusDetail.colorClass}`}
            >
              {currentStatusDetail.label}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              | Última atividade: {project.lastActivity}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/projects/$projectId/settings" params={{ projectId: project.id }}>
              <Settings className="mr-1.5 h-3.5 w-3.5" /> Configurações
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Ações <ChevronDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Play className="mr-2 h-4 w-4" /> Ativar/Continuar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pause className="mr-2 h-4 w-4" /> Pausar Projeto
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-600 dark:focus:text-red-500 dark:focus:bg-red-900/50">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir Projeto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
