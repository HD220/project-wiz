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

export function RootSidebar(props: RootSidebarProps) {
  const { projects, className } = props;
  const { user } = useAuth();

  return (
    <nav
      className={cn(
        "w-16 bg-sidebar/95 backdrop-blur-md flex flex-col items-center border-r border-sidebar-border/60 shadow-sm",
        "py-[var(--spacing-component-md)]",
        className,
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* User Space / Direct Messages */}
      <div className="mb-[var(--spacing-component-md)]">
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
                      "w-12 h-12 p-0 rounded-2xl border-2 transition-all duration-200 ease-out group relative",
                      "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                      "hover:scale-[1.01] hover:shadow-lg hover:shadow-sidebar-primary/20",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary rounded-[14px] shadow-md shadow-sidebar-primary/25 scale-105"
                        : "bg-sidebar-accent/80 border-transparent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground hover:rounded-[14px] hover:border-sidebar-primary/50",
                    )}
                    aria-label="Personal area"
                  >
                    <Avatar className="size-8 transition-transform duration-200 group-hover:scale-[1.01]">
                      <AvatarFallback className="bg-transparent text-inherit font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isActive && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary-foreground rounded-full" />
                    )}
                  </Button>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={16}
              className="bg-sidebar-foreground text-sidebar text-sm font-medium shadow-lg border border-sidebar-border/50"
            >
              <p>Área Pessoal</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator className="w-8 mb-[var(--spacing-component-md)] bg-sidebar-border/40" />

      {/* Projects List */}
      <div className="flex-1 flex flex-col items-center gap-[var(--spacing-component-sm)] overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border/60 scrollbar-track-transparent px-1">
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
                          "w-12 h-12 p-0 rounded-2xl border-2 transition-all duration-200 ease-out group relative",
                          "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                          "hover:scale-[1.01] hover:shadow-lg hover:shadow-sidebar-primary/20",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary rounded-[14px] shadow-md shadow-sidebar-primary/25 scale-105"
                            : "bg-sidebar-accent/60 border-transparent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground hover:rounded-[14px] hover:border-sidebar-primary/50",
                        )}
                        aria-label={`Open project: ${project.name}`}
                      >
                        {project.avatarUrl ? (
                          <img
                            src={project.avatarUrl}
                            alt=""
                            className="size-8 rounded-full transition-transform duration-200 group-hover:scale-[1.01]"
                          />
                        ) : (
                          <span className="font-bold text-base transition-transform duration-200 group-hover:scale-[1.01]">
                            {project.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        {isActive && (
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary-foreground rounded-full" />
                        )}
                      </Button>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={16}
                  className="bg-sidebar-foreground text-sidebar text-sm font-medium shadow-lg border border-sidebar-border/50"
                >
                  <p>{project.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center px-2">
            <p className="text-xs text-sidebar-foreground/60 text-center max-w-[50px] leading-relaxed font-medium">
              Nenhum projeto
            </p>
          </div>
        )}
      </div>

      <Separator className="w-8 my-[var(--spacing-component-md)] bg-sidebar-border/40" />

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-[var(--spacing-component-sm)]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CreateProjectDialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-12 h-12 p-0 rounded-2xl border-2 transition-all duration-200 ease-out group",
                    "bg-sidebar-accent/40 border-transparent text-sidebar-foreground/80",
                    "hover:bg-sidebar-accent hover:text-sidebar-foreground hover:rounded-[14px] hover:scale-[1.01] hover:shadow-md hover:shadow-sidebar-accent/25 hover:border-sidebar-border/30",
                    "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                    "active:scale-95 active:shadow-sm",
                  )}
                  aria-label="Add new project"
                >
                  <Plus className="w-5 h-5 transition-transform duration-200 group-hover:scale-[1.01]" />
                </Button>
              </CreateProjectDialog>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={16}
              className="bg-sidebar-foreground text-sidebar text-sm font-medium shadow-lg border border-sidebar-border/50"
            >
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
                className={cn(
                  "w-12 h-12 p-0 rounded-2xl border-2 transition-all duration-200 ease-out group",
                  "bg-sidebar-accent/40 border-transparent text-sidebar-foreground/80",
                  "hover:bg-sidebar-accent hover:text-sidebar-foreground hover:rounded-[14px] hover:scale-[1.01] hover:shadow-md hover:shadow-sidebar-accent/25 hover:border-sidebar-border/30",
                  "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                  "active:scale-95 active:shadow-sm",
                )}
                aria-label="Open settings"
              >
                <Settings className="w-5 h-5 transition-transform duration-200 group-hover:scale-[1.01]" />
              </CustomLink>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={16}
              className="bg-sidebar-foreground text-sidebar text-sm font-medium shadow-lg border border-sidebar-border/50"
            >
              <p>Configurações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  );
}
