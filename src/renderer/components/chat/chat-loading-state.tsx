import { Hash } from "lucide-react";

export function ChatLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Hash className="w-8 h-8 text-muted-foreground animate-pulse" />
      </div>
      <p className="text-muted-foreground">Carregando mensagens...</p>
    </div>
  );
}