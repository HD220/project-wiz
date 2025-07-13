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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, User, Target, BookOpen } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useConversations } from "../hooks/use-conversations.hook";
import { usePersonas } from "../../persona-management/hooks/use-personas.hook";

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationModal({
  open,
  onOpenChange,
}: NewConversationModalProps) {
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const { findOrCreateDirectMessage } = useConversations();
  const { activePersonas, isLoading: isLoadingActivePersonas } = usePersonas();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonaId.trim()) return;

    setIsSubmitting(true);
    try {
      // Create conversation with selected persona
      const selectedPersona = activePersonas?.find(p => p.id === selectedPersonaId);
      if (!selectedPersona) {
        console.error("Selected persona not found");
        return;
      }
      
      const conversation = await findOrCreateDirectMessage(['user', selectedPersona.nome]);
      
      if (conversation) {
        setSelectedPersonaId("");
        onOpenChange(false);
        // Navigate to the conversation automatically
        navigate({ 
          to: "/conversation/$conversationId", 
          params: { conversationId: conversation.id } 
        });
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedPersonaId("");
      onOpenChange(false);
    }
  };

  const selectedPersona = activePersonas?.find(persona => persona.id === selectedPersonaId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Nova Conversa
          </DialogTitle>
          <DialogDescription>
            Selecione uma persona para iniciar uma nova conversa direta.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Selecionar Persona</Label>
            <Select 
              value={selectedPersonaId} 
              onValueChange={setSelectedPersonaId}
              disabled={isLoadingActivePersonas}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma persona..." />
              </SelectTrigger>
              <SelectContent>
                {activePersonas?.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{persona.nome}</div>
                        <div className="text-xs text-muted-foreground">{persona.papel}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPersona && (
            <Card className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {selectedPersona.nome}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedPersona.papel}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Target className="w-3 h-3 mt-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {selectedPersona.goal.length > 100 
                        ? `${selectedPersona.goal.substring(0, 100)}...` 
                        : selectedPersona.goal}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-3 h-3 mt-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {selectedPersona.backstory.length > 100 
                        ? `${selectedPersona.backstory.substring(0, 100)}...` 
                        : selectedPersona.backstory}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedPersonaId.trim() || isSubmitting}>
              {isSubmitting ? "Criando..." : "Iniciar Conversa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}