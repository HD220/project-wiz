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
    <div
      className={cn(
        "w-14 bg-muted/50 flex flex-col items-center pb-2 border-r",
        className,
      )}
    >
      {/* User Space / Direct Messages */}
      <div className="h-12 flex items-center justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/user"
                search={{ showArchived: false }}
                className=""
                activeProps={{
                  className: "active",
                }}
              >
                {({ isActive }: { isActive: boolean }) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-10 h-10 p-0 rounded-full border transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-muted-foreground/30 hover:bg-primary hover:text-white hover:border-primary",
                    )}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-transparent text-inherit font-medium text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Área Pessoal</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator className="w-10 -mt-px mb-2" />

      {/* Projects List */}
      <div className="flex-1 flex flex-col items-center space-y-2 py-1 overflow-hidden">
        {projects.length > 0 ? (
          projects.map((project) => (
            <TooltipProvider key={project.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/project/$projectId"
                    params={{ projectId: project.id }}
                    search={{}}
                    className="relative"
                    activeProps={{
                      className: "active",
                    }}
                  >
                    {({ isActive }: { isActive: boolean }) => (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "w-10 h-10 p-0 rounded-full border transition-all duration-200 relative",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted border-muted-foreground/30 hover:bg-primary hover:text-white hover:border-primary",
                        )}
                      >
                        {project.avatarUrl ? (
                          <img
                            src={project.avatarUrl}
                            alt={project.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <span className="font-semibold text-sm">
                            {project.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </Button>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{project.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="text-xs text-muted-foreground text-center">
              Nenhum projeto
            </div>
          </div>
        )}
      </div>

      <Separator className="w-10 mt-2 mb-2" />

      {/* Action Buttons */}
      <div className="flex flex-col items-center space-y-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CreateProjectDialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 p-0 rounded-full border bg-muted border-muted-foreground/30 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </CreateProjectDialog>
            </TooltipTrigger>
            <TooltipContent side="right">
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
                className="w-10 h-10 p-0 rounded-full border bg-muted border-muted-foreground/30 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
              </CustomLink>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export { RootSidebar };
