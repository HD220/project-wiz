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
import { MessageSquare } from "lucide-react";
import { useConversations } from "../hooks/use-conversations.hook";

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated?: (conversationId: string) => void;
}

export function NewConversationModal({
  open,
  onOpenChange,
  onConversationCreated,
}: NewConversationModalProps) {
  const [agentId, setAgentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { findOrCreateDirectMessage } = useConversations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId.trim()) return;

    setIsSubmitting(true);
    try {
      // Assume user ID is 'user' for now
      const conversation = await findOrCreateDirectMessage(['user', agentId.trim()]);
      
      if (conversation) {
        onConversationCreated?.(conversation.id);
        setAgentId("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAgentId("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Nova Conversa
          </DialogTitle>
          <DialogDescription>
            Digite o ID do agente para iniciar uma nova conversa direta.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentId">ID do Agente</Label>
            <Input
              id="agentId"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="Digite o ID do agente"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!agentId.trim() || isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Conversa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}