import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AgentsSidebarEmptyProps {
  searchQuery: string;
  projectId?: string;
  onAddAgent: () => void;
}

export function AgentsSidebarEmpty({
  searchQuery,
  projectId,
  onAddAgent,
}: AgentsSidebarEmptyProps) {
  return (
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="text-center py-8">
        <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {searchQuery
            ? "Nenhum agente encontrado"
            : "Nenhum agente disponível"}
        </p>
        {projectId && !searchQuery && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddAgent}
            className="mt-2"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Agente
          </Button>
        )}
      </div>
    </ScrollArea>
  );
}
