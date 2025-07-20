import { AgentForm } from "@/components/agent-form";
import { AgentList } from "@/components/agent-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// TODO: Replace with actual user ID from auth context
const CURRENT_USER_ID = "demo-user-id";

export default function AgentsPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">
            Create and manage AI agents to collaborate on your projects
          </p>
        </div>

        {/* Agent Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentForm userId={CURRENT_USER_ID} />
          </CardContent>
        </Card>

        <Separator />

        {/* Agents List */}
        <div>
          <AgentList userId={CURRENT_USER_ID} />
        </div>
      </div>
    </div>
  );
}
