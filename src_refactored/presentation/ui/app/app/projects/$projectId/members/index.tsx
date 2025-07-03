import { createFileRoute, useParams } from "@tanstack/react-router";
import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteMemberFormSection } from "@/ui/features/project/components/members/InviteMemberFormSection";
import { MembersTableSection } from "@/ui/features/project/components/members/MembersTableSection";

interface Member {
  id: string;
  name: string;
  email?: string;
  role: "Admin" | "Membro" | "Editor" | "Visualizador";
  avatarUrl?: string;
  type: "human" | "agent";
  agentPersona?: string;
}

const mockMembers: Member[] = [
  {
    id: "user1",
    name: "Alice Wonderland",
    email: "alice@example.com",
    role: "Admin",
    avatarUrl: "/avatars/01.png",
    type: "human",
  },
  {
    id: "user2",
    name: "Bob Construtor",
    email: "bob@example.com",
    role: "Editor",
    avatarUrl: "/avatars/02.png",
    type: "human",
  },
  {
    id: "agent001",
    name: "CoderBot-Alpha",
    role: "Membro",
    type: "agent",
    agentPersona: "Eng. Software Sênior",
    avatarUrl: "/avatars/agent-coder.png",
  },
  {
    id: "user3",
    name: "Charlie Reviewer",
    email: "charlie@example.com",
    role: "Visualizador",
    type: "human",
  },
  {
    id: "agent002",
    name: "TestMaster-7000",
    role: "Membro",
    type: "agent",
    agentPersona: "Analista de QA",
    avatarUrl: "/avatars/agent-qa.png",
  },
];

function ProjectMembersPage() {
  const params = useParams({ from: "/(app)/projects/$projectId/members" });

  const [members] = useState<Member[]>(mockMembers);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Membros & Agentes do Projeto</CardTitle>
          <CardDescription>
            Gerencie quem tem acesso e quais agentes estão ativos neste projeto
            (ID: {params.projectId}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteMemberFormSection projectId={params.projectId} />
          <MembersTableSection members={members} />
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/app/projects/$projectId/members/")({
  component: ProjectMembersPage,
});

