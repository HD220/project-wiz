import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Search,
  MessageSquare,
  Play,
  Pause,
  Settings,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";
import { Agent, mockAgents } from "@/lib/placeholders";
import { cn } from "@/lib/utils";

interface AgentsSidebarProps {
  isOpen: boolean;
  onAgentSelect?: (agent: Agent) => void;
  projectId?: string;
}

export function AgentsSidebar({ isOpen, onAgentSelect, projectId }: AgentsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Filter agents - if projectId is provided, get agents for that project
  const relevantAgents = projectId 
    ? mockAgents.filter(agent => agent.projectId === projectId || !agent.projectId) // Show project-specific + global agents
    : mockAgents;

  const filteredAgents = relevantAgents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineAgents = filteredAgents.filter((a) => a.status !== "offline");
  const executingAgents = filteredAgents.filter((a) => a.isExecuting);

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "executing":
        return "bg-blue-500";
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

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    onAgentSelect?.(agent);
  };

  // This component is only rendered when open, so we don't need the collapsed state

  return (
    <div className="w-full bg-card border-l border-border flex flex-col h-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="h-12 px-3 flex items-center border-b border-border shadow-sm flex-none">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground truncate">
            Agentes
          </h2>
        </div>
      </div>

      {/* Stats */}
      <div className="p-2 border-b border-border flex-none">
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="min-w-0">
            <div className="text-sm font-bold truncate">{relevantAgents.length}</div>
            <div className="text-xs text-muted-foreground truncate">Total</div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-green-600 truncate">{onlineAgents.length}</div>
            <div className="text-xs text-muted-foreground truncate">Online</div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-blue-600 truncate">{executingAgents.length}</div>
            <div className="text-xs text-muted-foreground truncate">Ativo</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border flex-none">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar agentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background h-8"
          />
        </div>
      </div>

      {/* Agent List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2 space-y-1">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className={cn(
                "p-2 rounded-lg cursor-pointer transition-colors hover:bg-accent/50",
                selectedAgent?.id === agent.id && "bg-accent"
              )}
              onClick={() => handleAgentClick(agent)}
            >
              <div className="flex items-center gap-2">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={agent.avatar} />
                    <AvatarFallback className="text-xs">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-card rounded-full",
                      getStatusColor(agent.status)
                    )}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium truncate">{agent.name}</span>
                    {agent.isExecuting && (
                      <Loader2 className="w-3 h-3 animate-spin text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {agent.currentTask || agent.type}
                  </div>
                </div>

                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </div>

              {agent.isExecuting && agent.executionProgress && (
                <div className="mt-2">
                  <Progress value={agent.executionProgress} className="h-1" />
                </div>
              )}
            </div>
          ))}
          
          {filteredAgents.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhum agente encontrado
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {selectedAgent && (
        <div className="p-3 border-t border-border flex-none">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Ações Rápidas
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Button variant="outline" size="sm" className="h-8">
                <MessageSquare className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                {selectedAgent.isExecuting ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}