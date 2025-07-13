import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Search,
  Loader2,
  X,
  UserPlus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgents } from "../../agent-management/hooks/use-agents.hook";
import { AddAgentModal } from "./add-agent-modal";
import type { AgentDto } from "../../../../shared/types/agent.types";

interface AgentsSidebarProps {
  isOpen: boolean;
  onAgentSelect?: (agent: AgentDto) => void;
  projectId?: string;
}

export function AgentsSidebar({
  isOpen,
  onAgentSelect,
  projectId,
}: AgentsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Use agents hook
  const {
    activeAgents,
    isLoading,
    error,
    deleteAgent,
  } = useAgents();

  // Filter agents based on search query
  const filteredAgents = activeAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.goal.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRemoveAgent = async (agentId: string) => {
    try {
      await deleteAgent(agentId);
    } catch (error) {
      console.error("Failed to remove agent:", error);
    }
  };

  const handleAgentAdded = (agent: AgentDto) => {
    // Notify parent if needed
    onAgentSelect?.(agent);
  };

  // This component is only rendered when open, so we don't need the collapsed state

  return (
    <div className="w-full bg-card border-l border-border flex flex-col h-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="h-12 px-3 flex items-center justify-between border-b border-border shadow-sm flex-none">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground truncate">Agentes</h2>
        </div>
        {projectId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="h-8 w-8 p-0"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="p-2 border-b border-border flex-none">
        <div className="grid grid-cols-2 gap-1 text-center">
          <div className="min-w-0">
            <div className="text-sm font-bold truncate">
              {activeAgents.length}
            </div>
            <div className="text-xs text-muted-foreground truncate">Total</div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-green-600 truncate">
              {filteredAgents.length}
            </div>
            <div className="text-xs text-muted-foreground truncate">Ativas</div>
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

      {/* Error display */}
      {error && (
        <div className="p-3 border-b border-border flex-none">
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md flex items-center justify-between">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* clearError functionality to be implemented */}}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Agent List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="px-1.5 py-2 space-y-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Nenhum agente encontrado" : "Nenhum agente disponível"}
              </p>
              {projectId && !searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Agente
                </Button>
              )}
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="group relative px-1.5 py-1 rounded-md hover:bg-accent/50 transition-colors"
              >
                <div className="grid grid-cols-[auto_1fr_auto] gap-1.5 items-center w-full">
                  {/* Avatar - largura fixa */}
                  <div className="relative">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs">
                        {agent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border border-card rounded-full",
                        agent.isActive ? "bg-green-500" : "bg-gray-500",
                      )}
                    />
                  </div>

                  {/* Texto - largura flexível com truncamento */}
                  <div className="min-w-0 overflow-hidden">
                    <div className="text-xs font-medium truncate leading-3">
                      {agent.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate leading-3 mt-0.5">
                      {agent.role}
                    </div>
                  </div>

                  {/* Botão remover - largura fixa */}
                  <div className="w-4 flex justify-center">
                    {projectId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAgent(agent.id);
                        }}
                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-2.5 w-2.5 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        projectId={projectId}
        onAgentAdded={handleAgentAdded}
      />
    </div>
  );
}
