import { User } from "lucide-react";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface NewConversationAgentSelectorProps {
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
  agents: AgentDto[] | undefined;
  isLoading: boolean;
}

export function NewConversationAgentSelector({
  selectedAgentId,
  setSelectedAgentId,
  agents,
  isLoading,
}: NewConversationAgentSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Selecionar Agente</Label>
      <Select
        value={selectedAgentId}
        onValueChange={setSelectedAgentId}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Escolha um agente..." />
        </SelectTrigger>
        <SelectContent>
          {agents?.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {agent.role}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
