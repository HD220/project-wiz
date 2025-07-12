import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ProjectDto } from "../../../../shared/types/project.types";

interface ProjectSidebarItemProps {
  project: ProjectDto;
}

export function ProjectSidebarItem({
  project,
}: ProjectSidebarItemProps) {

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/project/$projectId"
            params={{ projectId: project.id }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl hover:rounded-xl transition-all duration-200 relative bg-muted hover:bg-muted/80 [&.active]:bg-primary [&.active]:rounded-xl [&.active]:before:content-[''] [&.active]:before:absolute [&.active]:before:left-0 [&.active]:before:top-1/2 [&.active]:before:-translate-y-1/2 [&.active]:before:-translate-x-1 [&.active]:before:w-1 [&.active]:before:h-8 [&.active]:before:bg-foreground [&.active]:before:rounded-r-full"
            activeProps={{
              className: "active"
            }}
            activeOptions={{ includeSearch: false }}
          >
            {project.avatar ? (
              <img
                src={project.avatar}
                alt={project.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-foreground">
                {project.name.slice(0, 2).toUpperCase()}
              </span>
            )}

            {project.unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
                variant="destructive"
              >
                {project.unreadCount > 9 ? "9+" : project.unreadCount}
              </Badge>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{project.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
