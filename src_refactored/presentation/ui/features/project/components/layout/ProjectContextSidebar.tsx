import { Link, useParams } from '@tanstack/react-router'; // Removed useRouter as it's not used here
import { BarChart2, MessageSquareText, BookText, Settings2, Users, ChevronDown, Hash, PlusCircle } from 'lucide-react';
import React from 'react';
// Added Hash and PlusCircle to imports, removed GripVertical as it's not used

import { Avatar, AvatarFallback } from '@/ui/components/ui/avatar'; // Removed AvatarImage
import { Button } from '@/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/ui/dropdown-menu";
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { Separator } from '@/ui/components/ui/separator';
import { cn } from '@/ui/lib/utils';


// Re-using Project type, assuming it's available or defined similarly elsewhere
interface Project {
  id: string;
  name: string;
  description?: string;
  // Add other relevant fields if needed for the sidebar header, e.g., project icon/color
}

interface ProjectSectionLinkProps {
  to: string;
  label: string;
  icon: React.ElementType; // Renamed prop from 'icon' to 'IconElement' in implementation
  projectId: string;
  // isActive prop removed as Link component handles active state
}

function ProjectSectionLink({ to, label, icon: IconElement, projectId }: ProjectSectionLinkProps) { // Renamed icon to IconElement
  return (
    <Link
      to={to}
      params={{ projectId }}
      resetScroll={false}
      className={cn(
        "flex items-center space-x-2.5 px-3 py-2 text-sm rounded-md transition-colors",
        "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/60" // Base classes
      )}
      activeProps={{
        // Classes to apply when the link is active
        className: "!bg-sky-100 dark:!bg-sky-700/60 !text-sky-700 dark:!text-sky-200 font-medium"
      }}
    >
      <IconElement className="h-4 w-4 flex-shrink-0" /> {/* Ensure icon is flex-shrink-0 if space is tight */}
      <span className="truncate">{label}</span>
    </Link>
  );
}


interface ProjectContextSidebarProps {
  project: Project | null;
  className?: string;
  // currentPath prop removed as it's not used for active state determination anymore
}

export function ProjectContextSidebar({ project, className }: ProjectContextSidebarProps) {
  // const params = useParams({ from: '/(app)/projects/$projectId' }); // Not strictly needed if projectId comes from props

  if (!project) {
    return ( // Skeleton loader
      <aside className={cn("w-60 flex-shrink-0 bg-slate-100 dark:bg-slate-800/70 p-4 border-r border-slate-200 dark:border-slate-700", className)}>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
        {[...Array(5)].map((_item, index) => ( // Renamed _ to _item, i to index
          <div key={index} className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
        ))}
      </aside>
    );
  }

  // For TanStack Router links from within a layout for a parameterized route (e.g., /projects/$projectId),
  // relative links like './settings' are often preferred for child routes.
  // Absolute paths need to include the dynamic params correctly.
  const sections = [
    { value: 'overview', label: 'Visão Geral', icon: BarChart2, to: `/projects/${project.id}/` }, // Trailing slash for index
    { value: 'chat', label: 'Chat/Canais', icon: MessageSquareText, to: `/projects/${project.id}/chat` },
    { value: 'docs', label: 'Documentação', icon: BookText, to: `/projects/${project.id}/docs` },
    { value: 'members', label: 'Membros & Agentes', icon: Users, to: `/projects/${project.id}/members` },
    { value: 'settings', label: 'Configurações', icon: Settings2, to: `/projects/${project.id}/settings` },
  ];

  // Placeholder for mock channels
  const mockChannels = [
    { id: 'ch_geral', name: 'geral', to: `/projects/${project.id}/chat/geral`}, // Example channel route
    { id: 'ch_dev', name: 'desenvolvimento', to: `/projects/${project.id}/chat/dev`},
    { id: 'ch_bugs', name: 'bugs', to: `/projects/${project.id}/chat/bugs`},
  ];

  return (
    <aside className={cn("w-60 flex-shrink-0 bg-slate-100 dark:bg-slate-800/70 flex flex-col border-r border-slate-200 dark:border-slate-700 h-full", className)}>
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
            <DropdownMenuItem asChild>
              {/* Link to project settings using its relative path from $projectId */}
              <Link to={`/projects/${project.id}/settings`} params={{projectId: project.id}}>Configurações do Projeto</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-500 dark:focus:text-red-500">Arquivar Projeto (N/I)</DropdownMenuItem>
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
            />
          ))}
        </nav>

        {/* Placeholder for other contextual lists like "Channels" or "Active Agents in Project" */}
        <div className="p-3 mt-2">
            <Separator className="my-2"/>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 mb-1.5 flex justify-between items-center">
                <span>Canais</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => alert("Novo canal (N/I)")}>
                    <PlusCircle className="h-3.5 w-3.5"/>
                </Button>
            </h4>
            <div className="space-y-0.5">
                {mockChannels.map(channel => (
                     <ProjectSectionLink
                        key={channel.id}
                        to={channel.to} // Use the defined channel route
                        label={`# ${channel.name}`}
                        icon={Hash}
                        projectId={project.id}
                    />
                ))}
            </div>
        </div>
      </ScrollArea>

      {/* Optional Footer for the project sidebar - Removed GripVertical as it's not imported and purpose unclear here */}
      {/*
      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            Menu do Projeto
        </Button>
      </div>
      */}
    </aside>
  );
}
