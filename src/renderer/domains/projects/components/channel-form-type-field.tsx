import { Hash, CheckSquare, Bot } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChannelTypeFieldProps {
  value: "general" | "task" | "agent";
  onChange: (value: "general" | "task" | "agent") => void;
}

export function ChannelTypeField({ value, onChange }: ChannelTypeFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="channel-type">Tipo de Canal</Label>
      <Select value={value} onValueChange={onChange}>
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
        </SelectContent>
      </Select>
    </div>
  );
}