import { Send, Paperclip, Smile } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  displayName: string;
  isAgentChat: boolean;
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput(props: ChatInputProps) {
  const { displayName, isAgentChat, onSendMessage, disabled = false } = props;
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) {
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const placeholder = isAgentChat
    ? `Mensagem para ${displayName}`
    : `Mensagem para #${displayName}`;

  return (
    <div className="p-4 border-t border-border flex-shrink-0">
      <div className="relative">
        <Textarea
          placeholder={placeholder}
          className="min-h-[44px] max-h-32 resize-none pr-12 py-3"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Smile className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            size="icon"
            className="w-8 h-8"
            onClick={handleSend}
            disabled={!message.trim() || isSending || disabled}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>Use **negrito**, *itálico*, `código` para formatar</span>
        <span>Enter para enviar, Shift+Enter para nova linha</span>
      </div>
    </div>
  );
}
