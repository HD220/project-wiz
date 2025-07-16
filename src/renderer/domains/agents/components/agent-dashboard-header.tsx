import { Plus } from "lucide-react";

import { Button } from '@/components/ui/button'

export function AgentDashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Agentes</h1>
        <p className="text-muted-foreground">
          Monitore e gerencie todos os seus agentes IA
        </p>
      </div>
      <Button className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Novo Agente
      </Button>
    </div>
  );
}
