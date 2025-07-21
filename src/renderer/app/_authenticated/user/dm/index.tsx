import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";

function DirectMessagesIndex() {
  return (
    <div className="max-w-4xl p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Direct Messages</h1>
        </div>
        <p className="text-muted-foreground">
          Chat directly with AI agents in your personal space
        </p>
      </div>

      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardHeader className="text-center">
          <CardTitle>No Active Conversations</CardTitle>
          <CardDescription>
            Start a conversation with an AI agent to begin chatting
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Select an agent from your available agents to start a direct message
            conversation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/dm/")({
  component: DirectMessagesIndex,
});
