import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Hash,
  MessageSquare,
  Users,
  Settings,
  MoreHorizontal,
  Home,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export function TopBar({
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
}: TopBarProps) {
  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case "channel":
        return <Hash className="w-5 h-5 text-muted-foreground" />;
      case "dm":
        return <MessageSquare className="w-5 h-5 text-muted-foreground" />;
      case "project":
        return <Code className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Home className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-red-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={cn(
        "h-12 px-4 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-none",
        className,
      )}
    >
      {/* Left side - Title and info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar or Icon */}
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
                  getStatusColor(),
                )}
              />
            )}
          </div>
        ) : (
          <div className="flex-shrink-0">{getIcon()}</div>
        )}

        {/* Title and subtitle */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-foreground truncate">{title}</h1>

            {/* Member count for channels */}
            {type === "channel" && memberCount && (
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {memberCount}
              </Badge>
            )}

            {/* Status badge for DMs */}
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

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Channel/DM specific actions */}

        {/* Agents sidebar toggle */}
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
