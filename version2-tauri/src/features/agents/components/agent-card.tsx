import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Agent } from '@/lib/types';

type AgentCardProps = {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
};

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  const statusColor = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-500',
  }[agent.user.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{agent.user.name}</CardTitle>
              <div className={`h-2 w-2 rounded-full ${statusColor}`} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {agent.config.role}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-1">Goal</h4>
          <p className="text-sm text-muted-foreground">{agent.config.goal}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-1">Backstory</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {agent.config.backstory}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{agent.config.model}</Badge>
          <Badge variant="outline">temp: {agent.config.temperature}</Badge>
          <Badge variant="outline">tokens: {agent.config.max_tokens}</Badge>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(agent)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(agent)}
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
