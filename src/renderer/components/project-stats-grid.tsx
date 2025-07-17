import { MessageSquare, Users, Activity } from "lucide-react";

import { Card } from "@/components/ui/card";

export function ProjectStatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <Card.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.CardTitle className="text-sm font-medium">
            Mensagens
          </Card.CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </Card.CardHeader>
        <Card.CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">+2 desde ontem</p>
        </Card.CardContent>
      </Card>

      <Card>
        <Card.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.CardTitle className="text-sm font-medium">
            Agentes Ativos
          </Card.CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </Card.CardHeader>
        <Card.CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">3 online agora</p>
        </Card.CardContent>
      </Card>

      <Card>
        <Card.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.CardTitle className="text-sm font-medium">
            Atividade
          </Card.CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </Card.CardHeader>
        <Card.CardContent>
          <div className="text-2xl font-bold">89%</div>
          <p className="text-xs text-muted-foreground">Última semana</p>
        </Card.CardContent>
      </Card>
    </div>
  );
}
