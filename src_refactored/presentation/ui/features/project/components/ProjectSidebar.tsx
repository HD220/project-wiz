// Removed useParams
import { Link } from '@tanstack/react-router';
// Removed Folder
import { ChevronRight, LayoutDashboard, CheckSquare, MessageSquare, FileText, Settings2, Hash, Plus } from 'lucide-react';
import React from 'react';

import { Button } from '@/ui/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/components/ui/collapsible';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { Separator } from '@/ui/components/ui/separator';

// Helper for NavLink, similar to AppSidebar but might have different base paths or active states
interface ProjectNavLinkProps {
  to: string;
  // e.g., /projects/$projectId
  basePath: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  // For matching exact paths - REMOVED as unused by Link's activeProps
  // exact?: boolean;
}

// Removed exact
function ProjectNavLink({ to, basePath, children, icon: iconProp }: ProjectNavLinkProps) {
  // Alias for JSX
  const IconComponent = iconProp;
  const fullPath = `${basePath}${to.startsWith('/') ? to : `/${to}`}`;
  return (
    <Link
      // Cast to string for dynamically constructed paths.
      // Consider using a more specific type if possible, or ensure paths are validated.
      to={fullPath as string}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
      activeProps={{ className: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50' }}
    >
      {IconComponent && <IconComponent className="h-4 w-4" />}
      <span>{children}</span>
    </Link>
  );
}


interface ProjectSidebarProps {
  className?: string;
  // projectId would likely be a prop, or read from router params if this component is route-aware
}

export function ProjectSidebar({ className }: ProjectSidebarProps) {
  // In a real scenario, projectId would come from router params or props.
  // if used in a route component
  // const params = useParams();
  // const projectId = params.projectId;
  // Placeholder
  const projectId = "{projectId}";

  // Placeholder data
  const project = {
    name: 'Projeto Alpha',
    // id: projectId,
  };

  const channels = [
    { id: 'general', name: 'general', type: 'text' },
    { id: 'random', name: 'random', type: 'text' },
    { id: 'dev-logs', name: 'dev-logs', type: 'text' },
  ];

  return (
    // This component itself is the content of a ResizablePanel.
    // The ResizablePanel, ResizablePanelGroup, and ResizableHandle would be used in a parent layout.
    <div className={`flex flex-col h-full bg-slate-100 dark:bg-slate-900 ${className || ''}`}>
      {/* Project Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">{project.name}</h2>
        {/* Could add a dropdown here for project actions */}
      </div>

      <ScrollArea className="flex-grow">
        <nav className="py-3 px-2">
          {/* Project Navigation */}
          <div className="space-y-1 mb-4">
            <ProjectNavLink basePath={`/projects/${projectId}`} to="/overview" icon={LayoutDashboard}>Overview</ProjectNavLink>
            <ProjectNavLink basePath={`/projects/${projectId}`} to="/tasks" icon={CheckSquare}>Tasks</ProjectNavLink>
            <ProjectNavLink basePath={`/projects/${projectId}`} to="/discussions" icon={MessageSquare}>Discussions</ProjectNavLink>
            <ProjectNavLink basePath={`/projects/${projectId}`} to="/files" icon={FileText}>Files</ProjectNavLink>
            <ProjectNavLink basePath={`/projects/${projectId}`} to="/settings" icon={Settings2}>Settings</ProjectNavLink>
          </div>

          <Separator className="my-3" />

          {/* Channels/Sections List */}
          <div>
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-3 py-2 text-sm font-medium">
                  <ChevronRight className="h-4 w-4 mr-2 transform transition-transform duration-200 group-[data-state=open]:rotate-90" />
                  Channels
                  <Plus className="ml-auto h-4 w-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1 space-y-0.5 ml-3 border-l border-slate-200 dark:border-slate-700 pl-3">
                {channels.map(channel => (
                  <Link
                    key={channel.id}
                    to={`/app/projects/${projectId}/channels/${channel.id}`}
                    className="flex items-center space-x-2 px-2 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md"
                    activeProps={{ className: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 font-medium' }}
                  >
                    <Hash className="h-3.5 w-3.5" />
                    <span className="truncate">{channel.name}</span>
                  </Link>
                ))}
                {channels.length === 0 && (
                  <p className="px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400">No channels.</p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
          {/* Add more collapsible sections if needed, e.g., DMs, Apps */}
        </nav>
      </ScrollArea>

      {/*
      Optional Footer for sidebar actions
      <div className="p-2 mt-auto border-t border-slate-200 dark:border-slate-700">
        <Button variant="ghost" size="sm" className="w-full justify-start">Some Action</Button>
      </div>
      */}
    </div>
  );
}

export default ProjectSidebar;
