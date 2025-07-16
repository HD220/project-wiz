import { Send, Paperclip, Smile } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";

interface ConversationMessageInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isDisabled: boolean;
  agentName: string;
}

export function ConversationMessageInput({
  messageInput,
  setMessageInput,
  onSend,
  onKeyDown,
  isDisabled,
  agentName,
}: ConversationMessageInputProps) {
  return (
    <div className="p-4 border-t border-border flex-shrink-0">
      <form onSubmit={onSend}>
        <div className="relative">
          <Textarea
            placeholder={
              isDisabled
                ? "Persona não encontrada..."
                : `Mensagem para ${agentName}`
            }
            className="min-h-[44px] max-h-32 resize-none pr-12 py-3"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isDisabled}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Smile className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="w-8 h-8"
              disabled={!messageInput.trim() || isDisabled}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>Use **negrito**, *itálico*, `código` para formatar</span>
        <span>Enter para enviar, Shift+Enter para nova linha</span>
      </div>
    </div>
  );
}
