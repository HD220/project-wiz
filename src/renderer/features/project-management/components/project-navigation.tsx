import { useState } from "react"; // useEffect import removed
// useSidebar import removed
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CustomLink } from "@/components/custom-link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { UserArea } from "../../user-management/components/user-area";
import type { ChannelDto } from "../../../../shared/types/channel.types";

interface ProjectNavigationProps {
  projectId: string;
  projectName: string;
  channels: ChannelDto[];
  onAddChannel: () => void; // Keep this as it opens a modal
}

export function ProjectNavigation({
  projectName,
  projectId,
  channels,
  onAddChannel,
}: ProjectNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
            placeholder="Buscar canais"
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
            <CustomLink
              to="/project/$projectId"
              params={{ projectId }}
              className="w-full justify-start px-2 py-1.5 h-auto"
              activeOptions={{ exact: true }}
              activeProps={{
                className: "bg-secondary text-secondary-foreground",
              }}
            >
              <Home className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Dashboard</span>
            </CustomLink>
            <CustomLink
              to="/project/$projectId/agents"
              params={{ projectId }}
              className="w-full justify-start px-2 py-1.5 h-auto"
              activeProps={{
                className: "bg-secondary text-secondary-foreground",
              }}
            >
              <Users className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Agentes</span>
            </CustomLink>
            <CustomLink
              to="/project/$projectId/tasks"
              params={{ projectId }}
              className="w-full justify-start px-2 py-1.5 h-auto"
              activeProps={{
                className: "bg-secondary text-secondary-foreground",
              }}
            >
              <CheckSquare className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Tarefas</span>
            </CustomLink>
            <CustomLink
              to="/project/$projectId/docs"
              params={{ projectId }}
              className="w-full justify-start px-2 py-1.5 h-auto"
              activeProps={{
                className: "bg-secondary text-secondary-foreground",
              }}
            >
              <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Documentos</span>
            </CustomLink>
          </div>

          {/* Text Channels */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-1 py-1 h-auto group"
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
                <CustomLink
                  key={channel.id}
                  to="/project/$projectId/chat/$channelId"
                  params={{ projectId, channelId: channel.id }}
                  className="w-full justify-start px-2 py-1.5 h-auto"
                  activeProps={{
                    className: "bg-secondary text-secondary-foreground",
                  }}
                >
                  <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{channel.name}</span>
                  {/* TODO: Implementar contador de mensagens não lidas */}
                </CustomLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* User Area */}
      <UserArea />
    </div>
  );
}
