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
import { useAgents } from "../../agent-management/hooks/use-agents.hook";

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationModal({
  open,
  onOpenChange,
}: NewConversationModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const { findOrCreateDirectMessage } = useConversations();
  const { activeAgents, isLoading: isLoadingAgents } = useAgents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId.trim()) return;

    setIsSubmitting(true);
    try {
      // Create conversation with selected agent
      const selectedAgent = activeAgents?.find(a => a.id === selectedAgentId);
      if (!selectedAgent) {
        console.error("Selected agent not found");
        return;
      }
      
      const conversation = await findOrCreateDirectMessage(['user', selectedAgent.name]);
      
      if (conversation) {
        setSelectedAgentId("");
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
      setSelectedAgentId("");
      onOpenChange(false);
    }
  };

  const selectedAgent = activeAgents?.find(agent => agent.id === selectedAgentId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Nova Conversa
          </DialogTitle>
          <DialogDescription>
            Selecione um agente para iniciar uma nova conversa direta.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Selecionar Agente</Label>
            <Select 
              value={selectedAgentId} 
              onValueChange={setSelectedAgentId}
              disabled={isLoadingAgents}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um agente..." />
              </SelectTrigger>
              <SelectContent>
                {activeAgents?.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.role}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAgent && (
            <Card className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {selectedAgent.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedAgent.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Target className="w-3 h-3 mt-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {selectedAgent.goal.length > 100 
                        ? `${selectedAgent.goal.substring(0, 100)}...` 
                        : selectedAgent.goal}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-3 h-3 mt-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {selectedAgent.backstory.length > 100 
                        ? `${selectedAgent.backstory.substring(0, 100)}...` 
                        : selectedAgent.backstory}
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
            <Button type="submit" disabled={!selectedAgentId.trim() || isSubmitting}>
              {isSubmitting ? "Criando..." : "Iniciar Conversa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}