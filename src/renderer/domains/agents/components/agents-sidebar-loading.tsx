import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AgentsSidebarLoading() {
  return (
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">
          Carregando...
        </span>
      </div>
    </ScrollArea>
  );
}
