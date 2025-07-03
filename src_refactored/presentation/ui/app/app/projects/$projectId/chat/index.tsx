import { createFileRoute, useParams } from "@tanstack/react-router";
import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { ChatWindow } from '@/ui/features/chat/components/ChatWindow'; // Future integration

function ProjectChatPage() {
  const params = useParams({ from: "/(app)/projects/$projectId/chat" });
  // const projectId = params.projectId; // Available if needed

  // TODO: Fetch project-specific chat channels and messages based on projectId
  // For now, a placeholder:

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Chat do Projeto</CardTitle>
          <CardDescription>
            Canais de comunicação e discussões para o projeto (ID:{" "}
            {params.projectId}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            (Placeholder para a interface de chat contextualizada do projeto)
          </p>
          <p className="mt-2 text-xs">
            Aqui você verá canais como #geral, #dev-logs, e poderá interagir com
            agentes no contexto deste projeto.
          </p>
          {/*
            <ChatWindow
              conversation={selectedProjectChannel || defaultAgentDMForProject}
              messages={projectMessages}
              onSendMessage={handleSendProjectMessage}
              isLoading={isLoadingProjectChat}
              currentUserId="currentUser" // Placeholder
            />
          */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Canal: #geral</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">Mensagens do canal #geral...</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Canal: #dev-logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            Logs de desenvolvimento e agentes...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/app/projects/$projectId/chat/")({
  component: ProjectChatPage,
});
