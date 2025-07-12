import { useState } from "react"; // useEffect import removed
// useSidebar import removed
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Hash,
  ChevronDown,
  Plus,
  Search,
  Volume2,
  Settings,
  Home,
  Users,
  FileText,
  CheckSquare,
} from "lucide-react";
import { Channel, Agent, mockUser } from "@/lib/placeholders";

interface ChannelsSidebarProps {
  projectId: string;
  projectName: string;
  channels: Channel[];
  agents: Agent[];
  selectedChannelId?: string;
  onChannelSelect: (channelId: string) => void;
  onAgentDMSelect: (agentId: string) => void;
  onAddChannel: () => void;
}

export function ChannelsSidebar({
  projectName,
  projectId,
  channels,
  agents,
  selectedChannelId,
  onChannelSelect,
  onAgentDMSelect,
  onAddChannel,
}: ChannelsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  // useSidebar and useEffect for setMode removed

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "executing":
        return "bg-blue-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onlineAgents = agents.filter((a) => a.status !== "offline");

  return (
    <div className="w-full bg-card border-r border-border flex flex-col h-full overflow-hidden">
      {/* Project Header */}
      <div className="h-12 px-3 flex items-center justify-between border-b border-border shadow-sm flex-none">
        <h2 className="font-semibold text-foreground truncate">
          {projectName}
        </h2>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border flex-none">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar canais e agentes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2 space-y-1">
          {/* Navigation Items */}
          <div className="space-y-0.5 mb-4">
            <Button
              variant={
                location.pathname === `/project/${projectId}/`
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start px-2 py-1.5 h-auto"
              asChild
            >
              <Link to="/project/$projectId" params={{ projectId }}>
                <Home className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button
              variant={
                location.pathname === `/project/${projectId}/agents`
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start px-2 py-1.5 h-auto"
              asChild
            >
              <Link to="/project/$projectId/agents" params={{ projectId }}>
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Agentes</span>
              </Link>
            </Button>
            <Button
              variant={
                location.pathname === `/project/${projectId}/tasks/`
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start px-2 py-1.5 h-auto"
              asChild
            >
              <Link to="/project/$projectId/tasks" params={{ projectId }}>
                <CheckSquare className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Tarefas</span>
              </Link>
            </Button>
            <Button
              variant={
                location.pathname === `/project/${projectId}/docs/`
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start px-2 py-1.5 h-auto"
              asChild
            >
              <Link to="/project/$projectId/docs" params={{ projectId }}>
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Documentos</span>
              </Link>
            </Button>
          </div>

          {/* Text Channels */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-1 py-1 h-auto"
              >
                <ChevronDown className="w-3 h-3 mr-1" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Canais de Texto
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChannel();
                  }}
                  className="ml-auto w-4 h-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-accent"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 mt-1">
              {filteredChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={
                    selectedChannelId === channel.id ? "secondary" : "ghost"
                  }
                  className="w-full justify-start px-2 py-1.5 h-auto"
                  onClick={() => onChannelSelect(channel.id)}
                >
                  <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{channel.name}</span>
                  {channel.unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-auto w-5 h-5 p-0 text-xs flex items-center justify-center"
                    >
                      {channel.unreadCount > 9 ? "9+" : channel.unreadCount}
                    </Badge>
                  )}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* User Area */}
      <div className="p-3 border-t border-border flex-none">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={mockUser.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {mockUser.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              {mockUser.name}
            </div>
            <div className="text-xs text-muted-foreground">Project Manager</div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
