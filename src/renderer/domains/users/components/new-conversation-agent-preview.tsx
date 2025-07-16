import { User, Target, BookOpen } from "lucide-react";

import { Card, CardContent } from '@/ui/card'

import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface NewConversationAgentPreviewProps {
  agent: AgentDto;
}

export function NewConversationAgentPreview({
  agent,
}: NewConversationAgentPreviewProps) {
  return (
    <Card className="border-muted">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="w-4 h-4" />
          {agent.name}
        </CardTitle>
        <CardDescription className="text-xs">{agent.role}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Target className="w-3 h-3 mt-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {agent.goal.length > 100
                ? `${agent.goal.substring(0, 100)}...`
                : agent.goal}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <BookOpen className="w-3 h-3 mt-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {agent.backstory.length > 100
                ? `${agent.backstory.substring(0, 100)}...`
                : agent.backstory}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
