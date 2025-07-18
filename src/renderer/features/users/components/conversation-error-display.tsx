import { Button } from "@/components/ui/button";

interface ConversationErrorDisplayProps {
  error: string;
  onClearError: () => void;
}

export function ConversationErrorDisplay({
  error,
  onClearError,
}: ConversationErrorDisplayProps) {
  return (
    <div className="flex items-center justify-between bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
      <span>{error}</span>
      <Button variant="ghost" size="sm" onClick={onClearError}>
        Limpar
      </Button>
    </div>
  );
}
