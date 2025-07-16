import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AiChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AiChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Digite sua mensagem...",
}: AiChatInputProps) {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      <Button onClick={onSend} disabled={disabled || !value.trim()} size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
