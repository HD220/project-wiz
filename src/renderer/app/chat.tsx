import { createFileRoute } from "@tanstack/react-router"
import { useState, useEffect } from "react";
// import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Users } from "lucide-react";

import { AgentChat } from "@/components/agent-chat";
// import { AgentCard } from "@/components/agent-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import { useAuthStore } from "@/renderer/store/auth-store";
import type { AgentData } from "@/renderer/types/agent-chat.types";

export const Route = createFileRoute("/chat")({
   component: Chat,
});

export function Chat() {
  const { user } = useAuthStore();
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const response = await window.api.agents.list();
      if (response.success && response.data && Array.isArray(response.data)) {
        setAgents(response.data);
        if (response.data.length > 0 && !selectedAgent) {
          setSelectedAgent(response.data[0]);
        }
      }
    } catch (error) {
      console.error("Error loading agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please log in to access the chat.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading agents...</p>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Agents Available</h2>
        <p className="text-muted-foreground mb-4">
          Create your first AI agent to start chatting.
        </p>
        <a
          href="/settings/agents"
          className="text-primary hover:underline"
        >
          Go to Agent Settings
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6 p-6">
      {/* Agent List Sidebar */}
      <Card className="w-80 flex-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Agents
            <Badge variant="secondary" className="ml-auto">
              {agents.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4 space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`cursor-pointer transition-colors rounded-lg p-3 border ${
                    selectedAgent?.id === agent.id
                      ? "bg-accent border-accent-foreground/20"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {agent.role}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={agent.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Separator orientation="vertical" />

      {/* Chat Interface */}
      <div className="flex-1">
        {selectedAgent ? (
          <AgentChat agent={selectedAgent} userId={user.id} />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Select an Agent to Chat
                </h3>
                <p className="text-muted-foreground">
                  Choose an agent from the sidebar to start a conversation.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}