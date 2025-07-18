import { Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getTopBarIcon } from "./top-bar-icon";
import { getStatusColor } from "./top-bar-status";

interface TopBarProps {
  title: string;
  subtitle?: string;
  type?: "channel" | "dm" | "page" | "project";
  icon?: React.ReactNode;
  avatar?: string;
  status?: "online" | "offline" | "busy" | "away";
  memberCount?: number;
  onToggleAgentsSidebar?: () => void;
  agentsSidebarOpen?: boolean;
  className?: string;
}

export function TopBar(props: TopBarProps) {
  const {
    title,
    subtitle,
    type = "page",
    icon,
    avatar,
    status,
    memberCount,
    onToggleAgentsSidebar,
    agentsSidebarOpen,
    className,
  } = props;

  return (
    <div
      className={cn(
        "h-12 px-4 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-none",
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {avatar ? (
          <div className="relative flex-shrink-0">
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-xs">
                {title.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {status && (
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-background rounded-full",
                  getStatusColor(status),
                )}
              />
            )}
          </div>
        ) : (
          <div className="flex-shrink-0">{getTopBarIcon(type, icon)}</div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-foreground truncate">{title}</h1>

            {type === "channel" && memberCount && (
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {memberCount}
              </Badge>
            )}

            {type === "dm" && status && (
              <Badge variant="outline" className="text-xs">
                {status}
              </Badge>
            )}
          </div>

          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {onToggleAgentsSidebar && (
          <Button
            variant={agentsSidebarOpen ? "default" : "ghost"}
            size="icon"
            onClick={onToggleAgentsSidebar}
            className="w-8 h-8"
          >
            <Users className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
