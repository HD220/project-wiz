import { Link } from '@tanstack/react-router';
// Added Play/Pause
import { Briefcase, MoreHorizontal, Trash2, Edit3, PlayCircle, PauseCircle } from 'lucide-react';
import React from 'react';

import type { Project } from "@/core/domain/entities/project.entity";

import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu';
import { Separator } from '@/ui/components/ui/separator';

interface ProjectActionsDropdownProps {
  project: Project;
  onEdit?: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
  onToggleStatus?: (projectId: string, currentStatus: Project['status']) => void;
  handleToggleStatus: (event: React.MouseEvent) => void;
}

function ProjectActionsDropdown({ project, onEdit, onDelete, onToggleStatus, handleToggleStatus }: ProjectActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Prevent card click */}
        <Button variant="ghost" size="icon" className="h-7 w-7 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800"
          onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Mais opções</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}>
        {onEdit && <DropdownMenuItem onClick={() => onEdit(project.id)}>
          <Edit3 className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Editar
        </DropdownMenuItem>}
        {project.status !== 'completed' && project.status !== 'archived' && onToggleStatus && (
          <DropdownMenuItem onClick={handleToggleStatus}>
            {project.status === 'active' ? <PauseCircle className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" /> : <PlayCircle className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />}
            {project.status === 'active' ? 'Pausar Projeto' : 'Ativar Projeto'}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {onDelete && <DropdownMenuItem className="text-red-600 dark:text-red-500 focus:text-red-600 dark:focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50" onClick={() => onDelete(project.id)}>
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Excluir
        </DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


interface ProjectListItemProps {
  project: Project;
  viewMode: 'grid' | 'list';
  // Optional delete handler
  onDelete?: (projectId: string) => void;
  // Optional edit handler
  onEdit?: (projectId: string) => void;
  // Optional status toggle
  onToggleStatus?: (projectId: string, currentStatus: Project['status']) => void;
}

const statusMap: Record<Project['status'], { label: string; color: string; icon?: React.ElementType }> = {
  active: { label: 'Ativo', color: 'bg-green-500 dark:bg-green-400' },
  paused: { label: 'Pausado', color: 'bg-yellow-500 dark:bg-yellow-400' },
  planning: { label: 'Planejamento', color: 'bg-blue-500 dark:bg-blue-400' },
  completed: { label: 'Concluído', color: 'bg-slate-500 dark:bg-slate-400' },
  // Default or fallback status
  archived: { label: 'Arquivado', color: 'bg-slate-700 dark:bg-slate-600' },
};

export function ProjectListItem({ project, viewMode, onDelete, onEdit, onToggleStatus }: ProjectListItemProps) {
  const projectStatus = statusMap[project.status] || statusMap.planning;

  const handleToggleStatus = (event: React.MouseEvent) => {
    // Prevent link navigation if button is inside a Link
    event.preventDefault();
    event.stopPropagation();
    onToggleStatus?.(project.id, project.status);
  }

  if (viewMode === 'list') {
    return (
      <Link to="/app/projects/$projectId" params={{ projectId: project.id }} className="block hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-lg">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className={`p-2 rounded-md hidden sm:block ${projectStatus.color} opacity-20`}>
               <Briefcase className={`h-5 w-5 ${projectStatus.color.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={project.name}>
                {project.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={project.description || "Sem descrição"}>
                {project.description || "Sem descrição"}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 mx-4">
            <div>Agentes: {project.agentCount}</div>
            <div>Tarefas: {project.taskCount}</div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
             <Badge style={{ backgroundColor: projectStatus.color }} className="text-xs text-white dark:text-black font-medium">
                {projectStatus.label}
             </Badge>
            <ProjectActionsDropdown
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              handleToggleStatus={handleToggleStatus}
            />
          </div>
        </div>
      </Link>
    );
  }

  // Grid View (Card)
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <Link to="/app/projects/$projectId" params={{ projectId: project.id }} className="flex flex-col flex-grow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-md ${projectStatus.color} opacity-20`}>
               <Briefcase className={`h-6 w-6 ${projectStatus.color.replace('bg-', 'text-')}`} />
            </div>
            {/* Placeholder for project image/icon if available */}
            {/* {project.imageUrl ? <img src={project.imageUrl} alt={project.name} className="w-12 h-12 rounded-lg object-cover"/> : <Briefcase className="w-10 h-10 text-slate-400" />} */}
            <Badge style={{ backgroundColor: projectStatus.color }} className="text-xs text-white dark:text-black font-medium">
              {projectStatus.label}
            </Badge>
          </div>
          <CardTitle className="mt-3 text-lg truncate" title={project.name}>{project.name}</CardTitle>
          <CardDescription className="text-xs h-8 line-clamp-2" title={project.description || "Sem descrição"}>
            {project.description || "Sem descrição"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow pb-3">
          {/* Could add more info here like key members, tech stack icons, etc. */}
           <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>Agentes: <span className="font-medium text-slate-700 dark:text-slate-300">{project.agentCount}</span></p>
            <p>Tarefas Ativas: <span className="font-medium text-slate-700 dark:text-slate-300">{project.taskCount}</span></p>
          </div>
        </CardContent>
      </Link>
      <Separator className="my-0" />
      <CardFooter className="p-3 flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Última atividade: {project.lastActivity}
        </p>
        <ProjectActionsDropdown
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          handleToggleStatus={handleToggleStatus}
        />
      </CardFooter>
    </Card>
  );
}

