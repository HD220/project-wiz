import { Link, useParams } from '@tanstack/react-router';
import { BarChart2, MessageSquareText, BookText, Settings2, Users, ChevronDown, GripVertical } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/components/ui/avatar';
import { Button } from '@/presentation/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/presentation/ui/components/ui/dropdown-menu";
import { ScrollArea } from '@/presentation/ui/components/ui/scroll-area';
import { Separator } from '@/presentation/ui/components/ui/separator';
import { cn } from '@/presentation/ui/lib/utils';


// Re-using Project type, assuming it's available or defined similarly elsewhere
interface Project {
  id: string;
  name: string;
  description?: string;
  // Add other relevant fields if needed for the sidebar header, e.g., project icon/color
}

interface ProjectSectionLinkProps {
  to: string; // This will be relative to the project's base path, e.g., './overview' or './settings'
  label: string;
  icon: React.ElementType;
  isActive?: boolean; // Parent will determine this based on current route
  projectId: string;
}

function ProjectSectionLink({ to, label, icon: Icon, isActive, projectId }: ProjectSectionLinkProps) {
  return (
    <Link
      to={to}
      params={{ projectId }} // Ensure projectId is passed for route matching
      resetScroll={false}
      className={cn(
        "flex items-center space-x-2.5 px-3 py-2 text-sm rounded-md transition-colors",
        isActive
          ? "bg-sky-100 dark:bg-sky-700/60 text-sky-700 dark:text-sky-200 font-medium"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      )}
      activeProps={{ className: "!bg-sky-100 dark:!bg-sky-700/60 !text-sky-700 dark:!text-sky-200 font-medium" }} // More specific active props
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}


interface ProjectContextSidebarProps {
  project: Project | null; // Can be null if project data is still loading
  className?: string;
  currentPath?: string; // To help determine active link
}

export function ProjectContextSidebar({ project, className, currentPath }: ProjectContextSidebarProps) {
  const params = useParams({ from: '/(app)/projects/$projectId' }); // Ensure this matches a route where projectId is a param

  if (!project) {
    return (
      <aside className={cn("w-60 flex-shrink-0 bg-slate-100 dark:bg-slate-800/70 p-4 border-r border-slate-200 dark:border-slate-700", className)}>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
        ))}
      </aside>
    );
  }

  const sections = [
    { value: 'overview', label: 'Visão Geral', icon: BarChart2, to: '/(app)/projects/$projectId/' }, // Points to the project's index route
    { value: 'chat', label: 'Chat/Canais', icon: MessageSquareText, to: '/(app)/projects/$projectId/chat' },
    { value: 'docs', label: 'Documentação', icon: BookText, to: '/(app)/projects/$projectId/docs' },
    { value: 'members', label: 'Membros & Agentes', icon: Users, to: '/(app)/projects/$projectId/members' },
    { value: 'settings', label: 'Configurações', icon: Settings2, to: '/(app)/projects/$projectId/settings' },
  ];

  return (
    <aside className={cn("w-60 flex-shrink-0 bg-slate-100 dark:bg-slate-800/70 flex flex-col border-r border-slate-200 dark:border-slate-700", className)}>
      {/* Project Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between items-center h-auto px-2 py-1.5">
              <div className="flex items-center space-x-2 min-w-0">
                <Avatar className="h-7 w-7 text-xs">
                  {/* Placeholder for project image or color-coded avatar */}
                  <AvatarFallback className="bg-sky-500 text-white">
                    {project.name.substring(0,1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100" title={project.name}>
                  {project.name}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 ml-2" align="start">
            <DropdownMenuLabel>Ações do Projeto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Convidar Membros (N/I)</DropdownMenuItem>
            <DropdownMenuItem>Configurações do Projeto</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-500">Arquivar Projeto (N/I)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {sections.map(section => (
            <ProjectSectionLink
              key={section.value}
              to={section.to}
              label={section.label}
              icon={section.icon}
              projectId={project.id}
              // Active state will be handled by TanStack Router's Link `activeProps`
              // isActive={currentPath?.startsWith(`/projects/${project.id}${section.to.substring(1)}`)} // Basic active check
            />
          ))}
        </nav>

        {/* Placeholder for other contextual lists like "Channels" or "Active Agents in Project" */}
        <div className="p-3 mt-2">
            <Separator className="my-2"/>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 mb-1.5 flex justify-between items-center">
                <span>Canais</span>
                <Button variant="ghost" size="icon" className="h-5 w-5"><PlusCircle className="h-3.5 w-3.5"/></Button>
            </h4>
            <div className="space-y-0.5">
                <ProjectSectionLink to="#" label="# geral" icon={Hash} projectId={project.id} />
                <ProjectSectionLink to="#" label="# desenvolvimento" icon={Hash} projectId={project.id} />
                <ProjectSectionLink to="#" label="# bugs" icon={Hash} projectId={project.id} />
            </div>
        </div>
      </ScrollArea>

      {/* Optional Footer for the project sidebar */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <GripVertical className="mr-2 h-4 w-4"/> Menu do Projeto
        </Button>
      </div>
    </aside>
  );
}
