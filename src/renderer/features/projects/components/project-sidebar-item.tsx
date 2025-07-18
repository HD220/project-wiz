import { Link, useRouterState } from "@tanstack/react-router";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/renderer/components/ui/tooltip";

import { ProjectAvatar } from "./project-avatar";
import { ProjectUnreadBadge } from "./project-unread-badge";

import type { ProjectDto } from "../../../../shared/types/projects/project.types";

interface ProjectSidebarItemProps {
  project: ProjectDto;
}

const SIDEBAR_STYLES =
  "inline-flex items-center justify-center w-12 h-12 rounded-2xl hover:rounded-xl transition-all duration-200 relative bg-muted hover:bg-muted/80 [&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:rounded-xl [&.active]:shadow-lg [&.active]:before:content-[''] [&.active]:before:absolute [&.active]:before:left-0 [&.active]:before:top-1/2 [&.active]:before:-translate-y-1/2 [&.active]:before:-translate-x-1 [&.active]:before:w-1 [&.active]:before:h-8 [&.active]:before:bg-primary-foreground [&.active]:before:rounded-r-full";

export function ProjectSidebarItem({ project }: ProjectSidebarItemProps) {
  const routerState = useRouterState();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/project/$projectId"
            params={{ projectId: project.id }}
            className={SIDEBAR_STYLES}
            activeProps={{ className: "active" }}
            activeOptions={{ includeSearch: false }}
          >
            <ProjectAvatar
              project={project}
              isLoading={
                routerState.isLoading &&
                routerState.location.pathname.includes(`/project/${project.id}`)
              }
            />
            <ProjectUnreadBadge unreadCount={project.unreadCount} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{project.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
