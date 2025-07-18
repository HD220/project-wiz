import { Hash } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ChatErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ChatErrorState({ error, onRetry }: ChatErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <Hash className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="font-semibold text-lg mb-2 text-destructive">
        Erro ao carregar mensagens
      </h3>
      <p className="text-muted-foreground">{error}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
