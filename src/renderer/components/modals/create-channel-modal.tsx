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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hash, Volume2, Lock } from "lucide-react";

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChannelModal({ open, onOpenChange }: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelType, setChannelType] = useState("text");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement channel creation logic
    console.log("Creating channel:", {
      name: channelName,
      description: channelDescription,
      type: channelType,
    });
    onOpenChange(false);
    // Reset form
    setChannelName("");
    setChannelDescription("");
    setChannelType("text");
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
            Adicione um novo canal ao seu projeto para organizar conversas e atividades.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-type">Tipo de Canal</Label>
            <Select value={channelType} onValueChange={setChannelType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Canal de Texto
                  </div>
                </SelectItem>
                <SelectItem value="voice">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Canal de Voz
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Canal Privado
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
              onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!channelName}>
              Criar Canal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}