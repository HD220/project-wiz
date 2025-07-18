import { Link } from "@tanstack/react-router";
import { Hash, Plus, Settings, Users, FileText, Bug } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice" | "announcement";
  unreadCount?: number;
}

interface NavigationChannelsProps {
  channels: Channel[];
  projectId: string;
  onAddChannel: () => void;
}

function ChannelItem({
  channel,
  projectId,
}: {
  channel: Channel;
  projectId: string;
}) {
  return (
    <Link
      to="/project/$projectId/chat/$channelId"
      params={{ projectId, channelId: channel.id }}
      className={cn(
        "flex items-center px-2 py-1 text-sm rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group",
      )}
    >
      <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
      <span className="truncate">{channel.name}</span>
      {channel.unreadCount && (
        <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-1 min-w-[1.25rem] h-5 flex items-center justify-center">
          {channel.unreadCount}
        </span>
      )}
    </Link>
  );
}

function NavigationSection({
  title,
  icon: Icon,
  onAdd,
  children,
}: {
  title: string;
  icon: any;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <div className="flex items-center">
          <Icon className="w-3 h-3 mr-2" />
          {title}
        </div>
        {onAdd && (
          <Button
            variant="ghost"
            size="icon"
            className="w-4 h-4 hover:bg-accent/50"
            onClick={onAdd}
          >
            <Plus className="w-3 h-3" />
          </Button>
        )}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function NavigationChannels({
  channels,
  projectId,
  onAddChannel,
}: NavigationChannelsProps) {
  const textChannels = channels.filter((c) => c.type === "text");

  return (
    <div className="space-y-2">
      {/* Text Channels */}
      <NavigationSection
        title="Canais de Texto"
        icon={Hash}
        onAdd={onAddChannel}
      >
        {textChannels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            projectId={projectId}
          />
        ))}
      </NavigationSection>

      <Separator />

      {/* Project Sections */}
      <NavigationSection title="Projeto" icon={Settings}>
        <Link
          to="/project/$projectId/agents"
          params={{ projectId }}
          className="flex items-center px-2 py-1 text-sm rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Users className="w-4 h-4 mr-2" />
          Agentes
        </Link>

        <Link
          to="/project/$projectId/tasks"
          params={{ projectId }}
          className="flex items-center px-2 py-1 text-sm rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Bug className="w-4 h-4 mr-2" />
          Issues
        </Link>

        <Link
          to="/project/$projectId/docs"
          params={{ projectId }}
          className="flex items-center px-2 py-1 text-sm rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <FileText className="w-4 h-4 mr-2" />
          Documentação
        </Link>
      </NavigationSection>
    </div>
  );
}
