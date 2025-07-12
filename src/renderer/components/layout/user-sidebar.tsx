import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  Plus,
  Search,
  Settings,
  Loader2,
  Home,
} from "lucide-react";
import { Agent, mockUser, mockAgents } from "@/lib/placeholders";

interface UserSidebarProps {
  agents: Agent[];
  onAgentDMSelect: (agentId: string) => void;
  onSettings: () => void;
}

export function UserSidebar({
  agents,
  onAgentDMSelect,
  onSettings,
}: UserSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

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

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onlineAgents = filteredAgents.filter((a) => a.status !== "offline");
  const offlineAgents = filteredAgents.filter((a) => a.status === "offline");

  return (
    <div className="w-full bg-card border-r border-border flex flex-col h-full overflow-hidden">
      {/* User Header */}
      <div className="h-12 px-3 flex items-center justify-between border-b border-border shadow-sm flex-none">
        <h2 className="font-semibold text-foreground truncate">
          Mensagens Diretas
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
            placeholder="Buscar conversas"
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
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              className="w-full justify-start px-2 py-1.5 h-auto"
              asChild
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-1.5 h-auto"
              onClick={onSettings}
            >
              <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Configurações</span>
            </Button>
          </div>

          {/* Direct Messages */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-1 py-1 h-auto group"
              >
                <ChevronDown className="w-3 h-3 mr-1" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Mensagens Diretas — {onlineAgents.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Open new conversation modal
                  }}
                  className="ml-auto w-4 h-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-accent"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 mt-1">
              {/* Online Agents */}
              {onlineAgents.map((agent) => (
                <Button
                  key={agent.id}
                  variant="ghost"
                  className="w-full justify-start px-2 py-1.5 h-auto text-left"
                  onClick={() => onAgentDMSelect(agent.id)}
                >
                  <div className="w-6 h-6 mr-2 relative flex-shrink-0">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={agent.avatar} />
                      <AvatarFallback className="text-xs">
                        {agent.avatar || agent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-card rounded-full",
                        getStatusColor(agent.status),
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{agent.name}</span>
                      {agent.isExecuting && (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      )}
                    </div>
                    {agent.currentTask && (
                      <div className="text-xs text-muted-foreground truncate">
                        {agent.currentTask}
                      </div>
                    )}
                  </div>
                </Button>
              ))}

              {/* Offline Agents */}
              {offlineAgents.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1 mt-2">
                    Offline — {offlineAgents.length}
                  </div>
                  {offlineAgents.map((agent) => (
                    <Button
                      key={agent.id}
                      variant="ghost"
                      className="w-full justify-start px-2 py-1.5 h-auto text-left opacity-60"
                      onClick={() => onAgentDMSelect(agent.id)}
                    >
                      <div className="w-6 h-6 mr-2 relative flex-shrink-0">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback className="text-xs">
                            {agent.avatar ||
                              agent.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-card rounded-full",
                            getStatusColor(agent.status),
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="truncate font-medium">
                          {agent.name}
                        </span>
                      </div>
                    </Button>
                  ))}
                </>
              )}
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
        </div>
      </div>
    </div>
  );
}
