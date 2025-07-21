import { Link } from "@tanstack/react-router";
import { Plus, Settings } from "lucide-react";

import { useAuthStore } from "@/renderer/store/auth.store";

import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
import { Button } from "@/renderer/components/ui/button";
import { CustomLink } from "@/renderer/components/custom-link";
import { Separator } from "@/renderer/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/renderer/components/ui/tooltip";
import { cn } from "@/renderer/lib/utils";

interface Server {
  id: string;
  name: string;
  icon?: string;
  hasNotification?: boolean;
}

interface RootSidebarProps {
  className?: string;
}

function RootSidebar(props: RootSidebarProps) {
  const { className } = props;
  const { user } = useAuthStore();

  // Mock servers data - in real app this would come from a store
  const servers: Server[] = [
    { id: "server-1", name: "Project Alpha", hasNotification: true },
    { id: "server-2", name: "Team Beta" },
    { id: "server-3", name: "Community", hasNotification: false },
  ];

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

      {/* Servers List */}
      <div className="flex-1 flex flex-col items-center space-y-2 py-1 overflow-hidden">
        {servers.map((server) => (
          <TooltipProvider key={server.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/project/$projectId"
                  params={{ projectId: server.id }}
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
                      {server.icon ? (
                        <img
                          src={server.icon}
                          alt={server.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <span className="font-semibold text-sm">
                          {server.name.charAt(0).toUpperCase()}
                        </span>
                      )}

                      {/* Notification indicator */}
                      {server.hasNotification && !isActive && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border border-background" />
                      )}
                    </Button>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{server.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      <Separator className="w-10 mt-2 mb-2" />

      {/* Action Buttons */}
      <div className="flex flex-col items-center space-y-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 p-0 rounded-full border bg-muted border-muted-foreground/30 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
              </Button>
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
