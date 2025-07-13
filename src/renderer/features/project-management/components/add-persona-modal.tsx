import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Plus, Loader2 } from "lucide-react";
import { useProjectPersonas } from "../hooks/use-project-personas.hook";
import type { PersonaDto } from "../../../../shared/types/persona.types";

interface AddPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onPersonaAdded?: (persona: PersonaDto) => void;
}

export function AddPersonaModal({
  isOpen,
  onClose,
  projectId,
  onPersonaAdded,
}: AddPersonaModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  const {
    availablePersonas,
    isLoading,
    error,
    addPersonaToProject,
    clearError,
  } = useProjectPersonas(projectId);

  // Filter personas based on search query
  const filteredPersonas = availablePersonas.filter(
    (persona) =>
      persona.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.papel.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handlePersonaToggle = (personaId: string) => {
    const newSelected = new Set(selectedPersonas);
    if (newSelected.has(personaId)) {
      newSelected.delete(personaId);
    } else {
      newSelected.add(personaId);
    }
    setSelectedPersonas(newSelected);
  };

  const handleAddPersonas = async () => {
    if (selectedPersonas.size === 0) return;

    setIsAdding(true);
    try {
      // Add each selected persona to the project
      for (const personaId of selectedPersonas) {
        await addPersonaToProject(personaId, "current-user"); // TODO: Get actual user ID
        
        // Find the added persona and notify parent
        const addedPersona = availablePersonas.find(p => p.id === personaId);
        if (addedPersona && onPersonaAdded) {
          onPersonaAdded(addedPersona);
        }
      }

      // Reset state and close modal
      setSelectedPersonas(new Set());
      setSearchQuery("");
      onClose();
    } catch (error) {
      // Error is handled by the hook
      console.error("Failed to add personas:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedPersonas(new Set());
    setSearchQuery("");
    clearError();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Adicionar Personas ao Projeto
          </DialogTitle>
          <DialogDescription>
            Selecione as personas que deseja adicionar ao projeto. Apenas personas ativas são exibidas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar personas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Personas list */}
          <ScrollArea className="h-[300px] border rounded-md">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando personas...</span>
              </div>
            ) : filteredPersonas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mb-2" />
                <p className="text-sm">
                  {searchQuery
                    ? "Nenhuma persona encontrada"
                    : "Todas as personas ativas já estão no projeto"}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredPersonas.map((persona) => (
                  <div
                    key={persona.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      selectedPersonas.has(persona.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-accent border-transparent"
                    }`}
                    onClick={() => handlePersonaToggle(persona.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {persona.nome.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {persona.nome}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {persona.papel}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {selectedPersonas.has(persona.id) && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Plus className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selection summary */}
          {selectedPersonas.size > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedPersonas.size} persona(s) selecionada(s)
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddPersonas}
            disabled={selectedPersonas.size === 0 || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar ({selectedPersonas.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}