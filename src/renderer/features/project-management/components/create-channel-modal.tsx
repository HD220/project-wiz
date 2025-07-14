import { Hash, Volume2, Lock, CheckSquare, Bot } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

import { useProjectChannels } from "../../communication/hooks/use-channels.hook";
// Removed ChannelTypeEnum - channels are text-only

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function CreateChannelModal({
  open,
  onOpenChange,
  projectId,
}: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelType, setChannelType] = useState<"general" | "task" | "agent">(
    "general",
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createChannel, error, clearError } = useProjectChannels(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!channelName.trim()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await createChannel({
        name: channelName.trim(),
        description: channelDescription.trim() || undefined,
        isPrivate,
        createdBy: "current-user", // TODO: Get from user context
      });

      // Success - close modal and reset form
      onOpenChange(false);
      resetForm();
    } catch (error) {
      // Error is handled by the store
      console.error("Error creating channel:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setChannelName("");
    setChannelDescription("");
    setChannelType("general");
    setIsPrivate(false);
    clearError();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Criar Novo Canal
          </DialogTitle>
          <DialogDescription>
            Adicione um novo canal ao seu projeto para organizar conversas e
            atividades.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-type">Tipo de Canal</Label>
            <Select
              value={channelType}
              onValueChange={(value: "general" | "task" | "agent") =>
                setChannelType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Canal Geral
                  </div>
                </SelectItem>
                <SelectItem value="task">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Canal de Tarefas
                  </div>
                </SelectItem>
                <SelectItem value="agent">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Canal de Agente
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Canal Personalizado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-name">Nome do Canal</Label>
            <Input
              id="channel-name"
              placeholder="geral, desenvolvimento, discussoes"
              value={channelName}
              onChange={(e) =>
                setChannelName(
                  e.target.value.toLowerCase().replace(/\s+/g, "-"),
                )
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-description">Descrição (Opcional)</Label>
            <Textarea
              id="channel-description"
              placeholder="Para que serve este canal..."
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="channel-private"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor="channel-private" className="text-sm font-normal">
              Canal Privado
            </Label>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!channelName.trim() || isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar Canal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
