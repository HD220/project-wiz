import { Link } from "@tanstack/react-router";
import { Plus, Settings } from "lucide-react";

import type { SelectProject } from "@/main/features/project/project.types";

import { CustomLink } from "@/renderer/components/custom-link";
import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
import { Button } from "@/renderer/components/ui/button";
import { Separator } from "@/renderer/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/renderer/components/ui/tooltip";
import { useAuth } from "@/renderer/contexts/auth.context";
import { CreateProjectDialog } from "@/renderer/features/project/components";
import { cn } from "@/renderer/lib/utils";

interface RootSidebarProps {
  projects: SelectProject[];
  className?: string;
}

function RootSidebar(props: RootSidebarProps) {
  const { projects, className } = props;
  const { user } = useAuth();

  return (
    <nav
      className={cn(
        "w-16 bg-background/80 backdrop-blur-sm flex flex-col items-center py-3 border-r border-border/50",
        className,
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* User Space / Direct Messages */}
      <div className="mb-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/user"
                activeProps={{
                  className: "active",
                }}
              >
                {({ isActive }: { isActive: boolean }) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-12 h-12 p-0 rounded-2xl border-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary rounded-[16px]"
                        : "bg-muted/60 border-transparent hover:bg-primary hover:text-primary-foreground hover:rounded-[16px]",
                    )}
                    aria-label="Personal area"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-transparent text-inherit font-medium text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              <p>Área Pessoal</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator className="w-8 mb-3" />

      {/* Projects List */}
      <div className="flex-1 flex flex-col items-center space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {projects.length > 0 ? (
          projects.map((project) => (
            <TooltipProvider key={project.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/project/$projectId"
                    params={{ projectId: project.id }}
                    activeProps={{
                      className: "active",
                    }}
                  >
                    {({ isActive }: { isActive: boolean }) => (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "w-12 h-12 p-0 rounded-2xl border-2 transition-all duration-200 relative focus-visible:ring-2 focus-visible:ring-ring",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary rounded-[16px]"
                            : "bg-muted/60 border-transparent hover:bg-primary hover:text-primary-foreground hover:rounded-[16px]",
                        )}
                        aria-label={`Open project: ${project.name}`}
                      >
                        {project.avatarUrl ? (
                          <img
                            src={project.avatarUrl}
                            alt=""
                            className="w-7 h-7 rounded-full"
                          />
                        ) : (
                          <span className="font-semibold text-base">
                            {project.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </Button>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  <p>{project.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center px-2">
            <p className="text-xs text-muted-foreground text-center max-w-[50px] leading-relaxed">
              Nenhum projeto
            </p>
          </div>
        )}
      </div>

      <Separator className="w-8 mt-3 mb-3" />

      {/* Action Buttons */}
      <div className="flex flex-col items-center space-y-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CreateProjectDialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 p-0 rounded-2xl border-2 bg-muted/40 border-transparent hover:bg-accent hover:text-foreground hover:rounded-[16px] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Add new project"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </CreateProjectDialog>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              <p>Adicionar Projeto</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CustomLink
                to="/user/settings"
                variant="ghost"
                size="icon"
                className="w-12 h-12 p-0 rounded-2xl border-2 bg-muted/40 border-transparent hover:bg-accent hover:text-foreground hover:rounded-[16px] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Open settings"
              >
                <Settings className="w-6 h-6" />
              </CustomLink>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              <p>Configurações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  );
}

export { RootSidebar };
