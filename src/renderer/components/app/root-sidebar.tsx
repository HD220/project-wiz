import { Link } from "@tanstack/react-router";
import { Plus, Settings } from "lucide-react";

import { CustomLink } from "@/renderer/components/custom-link";
import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/renderer/components/ui/tooltip";
import { useAuth } from "@/renderer/contexts/auth.context";
import { cn } from "@/renderer/lib/utils";

import type { Project } from "@/shared/types";

interface RootSidebarProps {
  projects: Project[];
  className?: string;
}

export function RootSidebar(props: RootSidebarProps) {
  const { projects, className } = props;
  const { user } = useAuth();

  return (
    <nav
      className={cn(
        "w-12 lg:w-16", // Responsive width: 12 on small screens, 16 on large
        "bg-sidebar/95 backdrop-blur-md flex flex-col items-center border-r border-sidebar-border/60 shadow-sm transition-all duration-200",
        "py-[var(--spacing-component-sm)] lg:py-[var(--spacing-component-md)]", // Responsive padding
        className,
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* User Space / Direct Messages */}
      <div className="mb-[var(--spacing-component-md)] ml-1">
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
                      "w-10 h-10 lg:w-12 lg:h-12", // Responsive button size
                      "p-0 rounded-2xl border-2 transition-all duration-200 ease-out group relative cursor-pointer",
                      "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                      "hover:scale-[1.01] hover:shadow-lg hover:shadow-sidebar-primary/20",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary rounded-[14px] shadow-md shadow-sidebar-primary/25 scale-105"
                        : "bg-sidebar-accent/80 border-transparent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground hover:rounded-[14px] hover:border-sidebar-primary/50",
                    )}
                    aria-label="Personal area"
                  >
                    <Avatar className="size-6 lg:size-8 transition-transform duration-200 group-hover:scale-[1.01]">
                      <AvatarFallback className="bg-transparent text-inherit font-semibold text-xs lg:text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isActive && (
                      <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary-foreground rounded-full z-10" />
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

      <Separator className="w-6 lg:w-8 mb-[var(--spacing-component-md)] bg-sidebar-border/40" />

      {/* Projects List */}
      <ScrollArea className="flex-1 px-1">
        <div className="flex flex-col items-center gap-[var(--spacing-component-sm)] ml-1">
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
                            "w-10 h-10 lg:w-12 lg:h-12", // Responsive button size
                            "p-0 rounded-2xl border-2 transition-all duration-200 ease-out group relative cursor-pointer",
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
                              className="size-6 lg:size-8 rounded-full transition-transform duration-200 group-hover:scale-[1.01]"
                            />
                          ) : (
                            <span className="font-bold transition-transform duration-200 group-hover:scale-[1.01] text-sm lg:text-base">
                              {project.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          {isActive && (
                            <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary-foreground rounded-full z-10" />
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
      </ScrollArea>

      <Separator className="w-6 lg:w-8 my-[var(--spacing-component-md)] bg-sidebar-border/40" />

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-[var(--spacing-component-sm)]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CustomLink
                to="/project/new"
                variant="ghost"
                size="icon"
                className={cn(
                  "w-10 h-10 lg:w-12 lg:h-12", // Responsive button size
                  "p-0 rounded-2xl border-2 transition-all duration-200 ease-out group cursor-pointer",
                  "bg-sidebar-accent/40 border-transparent text-sidebar-foreground/80",
                  "hover:bg-sidebar-accent hover:text-sidebar-foreground hover:rounded-[14px] hover:scale-[1.01] hover:shadow-md hover:shadow-sidebar-accent/25 hover:border-sidebar-border/30",
                  "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                  "active:scale-95 active:shadow-sm",
                )}
                aria-label="Add new project"
              >
                <Plus className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 group-hover:scale-[1.01]" />
              </CustomLink>
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
                  "w-10 h-10 lg:w-12 lg:h-12", // Responsive button size
                  "p-0 rounded-2xl border-2 transition-all duration-200 ease-out group cursor-pointer",
                  "bg-sidebar-accent/40 border-transparent text-sidebar-foreground/80",
                  "hover:bg-sidebar-accent hover:text-sidebar-foreground hover:rounded-[14px] hover:scale-[1.01] hover:shadow-md hover:shadow-sidebar-accent/25 hover:border-sidebar-border/30",
                  "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                  "active:scale-95 active:shadow-sm",
                )}
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 group-hover:scale-[1.01]" />
              </CustomLink>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={16}
              className="bg-sidebar-foreground text-sidebar text-sm font-medium shadow-lg border border-sidebar-border/50"
            >
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  );
}
