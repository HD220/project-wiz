import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Folder } from "lucide-react";
import { Project } from "@/lib/placeholders";

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
  onSettings: () => void;
}

export function ProjectSidebar({
  projects,
  selectedProjectId,
  onProjectSelect,
  onCreateProject,
  onSettings,
}: ProjectSidebarProps) {
  return (
    <div className="w-18 bg-sidebar border-r border-border flex flex-col items-center py-3 space-y-2">
      {/* Home/Dashboard */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 hover:rounded-xl transition-all duration-200"
            >
              <Folder className="h-6 w-6 text-primary-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Dashboard</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Separator */}
      <div className="w-8 h-0.5 bg-border rounded-full" />

      {/* Project List */}
      <div className="flex flex-col space-y-2 flex-1">
        {projects.map((project) => (
          <TooltipProvider key={project.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onProjectSelect(project.id)}
                  className={cn(
                    "w-12 h-12 rounded-2xl hover:rounded-xl transition-all duration-200 relative",
                    selectedProjectId === project.id
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

                  {/* Notification indicator */}
                  {project.unreadCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
                      variant="destructive"
                    >
                      {project.unreadCount > 9 ? "9+" : project.unreadCount}
                    </Badge>
                  )}

                  {/* Selection indicator */}
                  {selectedProjectId === project.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1 h-8 bg-foreground rounded-r-full" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{project.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Add Project Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateProject}
              className="w-12 h-12 rounded-2xl border-2 border-dashed border-muted-foreground hover:border-solid hover:border-green-500 hover:bg-green-500/10 hover:rounded-xl transition-all duration-200"
            >
              <Plus className="h-6 w-6 text-muted-foreground hover:text-green-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Adicionar Projeto</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Settings */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettings}
              className="w-12 h-12 rounded-2xl bg-muted hover:bg-muted/80 hover:rounded-xl transition-all duration-200"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Configurações</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
