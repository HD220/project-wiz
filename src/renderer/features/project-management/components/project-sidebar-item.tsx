import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProjectDto } from "../../../../shared/types/project.types";

interface ProjectSidebarItemProps {
  project: ProjectDto;
  isSelected: boolean;
  onSelect: (projectId: string) => void;
}

export function ProjectSidebarItem({
  project,
  isSelected,
  onSelect,
}: ProjectSidebarItemProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSelect(project.id)}
            className={cn(
              "w-12 h-12 rounded-2xl hover:rounded-xl transition-all duration-200 relative",
              isSelected
                ? "bg-primary rounded-xl"
                : "bg-muted hover:bg-muted/80",
            )}
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

            {isSelected && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1 h-8 bg-foreground rounded-r-full" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{project.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
