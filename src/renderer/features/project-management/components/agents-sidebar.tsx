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
import { useProjectPersonas } from "../hooks/use-project-personas.hook";
import { AddPersonaModal } from "./add-persona-modal";
import type { PersonaDto } from "../../../../shared/types/persona.types";

interface AgentsSidebarProps {
  isOpen: boolean;
  onPersonaSelect?: (persona: PersonaDto) => void;
  projectId?: string;
}

export function AgentsSidebar({
  isOpen,
  onPersonaSelect,
  projectId,
}: AgentsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Use project personas hook
  const {
    projectPersonas,
    isLoading,
    error,
    removePersonaFromProject,
    clearError,
  } = useProjectPersonas(projectId);

  // Filter personas based on search query
  const filteredPersonas = projectPersonas.filter(
    (persona) =>
      persona.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.papel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.goal.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activePersonas = filteredPersonas.filter((p) => p.isActive);

  const handleRemovePersona = async (personaId: string) => {
    if (!projectId) return;
    
    try {
      await removePersonaFromProject(personaId);
    } catch (error) {
      console.error("Failed to remove persona:", error);
    }
  };

  const handlePersonaAdded = (persona: PersonaDto) => {
    // Notify parent if needed
    onPersonaSelect?.(persona);
  };

  // This component is only rendered when open, so we don't need the collapsed state

  return (
    <div className="w-full bg-card border-l border-border flex flex-col h-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="h-12 px-3 flex items-center justify-between border-b border-border shadow-sm flex-none">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground truncate">Personas</h2>
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
              {projectPersonas.length}
            </div>
            <div className="text-xs text-muted-foreground truncate">Total</div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-green-600 truncate">
              {activePersonas.length}
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
            placeholder="Buscar personas..."
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
              onClick={clearError}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Persona List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="px-1.5 py-2 space-y-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
            </div>
          ) : filteredPersonas.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Nenhuma persona encontrada" : "Nenhuma persona no projeto"}
              </p>
              {projectId && !searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Persona
                </Button>
              )}
            </div>
          ) : (
            filteredPersonas.map((persona) => (
              <div
                key={persona.id}
                className="group relative px-1.5 py-1 rounded-md hover:bg-accent/50 transition-colors"
              >
                <div className="grid grid-cols-[auto_1fr_auto] gap-1.5 items-center w-full">
                  {/* Avatar - largura fixa */}
                  <div className="relative">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs">
                        {persona.nome.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border border-card rounded-full",
                        persona.isActive ? "bg-green-500" : "bg-gray-500",
                      )}
                    />
                  </div>

                  {/* Texto - largura flexível com truncamento */}
                  <div className="min-w-0 overflow-hidden">
                    <div className="text-xs font-medium truncate leading-3">
                      {persona.nome}
                    </div>
                    <div className="text-xs text-muted-foreground truncate leading-3 mt-0.5">
                      {persona.papel}
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
                          handleRemovePersona(persona.id);
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

      {/* Add Persona Modal */}
      {projectId && (
        <AddPersonaModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          projectId={projectId}
          onPersonaAdded={handlePersonaAdded}
        />
      )}
    </div>
  );
}
