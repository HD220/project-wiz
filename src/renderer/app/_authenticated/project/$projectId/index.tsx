import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ProjectView } from "@/renderer/components/app/server-view";
import { ContentHeader } from "@/renderer/components/layout/content-header";
import {
  MemberSidebar,
  type Member,
} from "@/renderer/components/members/member-sidebar";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { loadApiData } from "@/renderer/lib/route-loader";

function ProjectPage() {
  const { project } = Route.useLoaderData();
  const [isMemberSidebarCollapsed, setIsMemberSidebarCollapsed] =
    useState(false);

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  // Mock members data - TODO: Replace with real project members + agents
  const mockMembers: Member[] = [
    {
      id: "1",
      name: "Nicolas",
      username: "nicolas",
      status: "online",
      role: "owner",
    },
    {
      id: "2",
      name: "Claude",
      username: "claude-agent",
      status: "online",
      role: "member", // Agent appears as member
    },
    {
      id: "3",
      name: "John Developer",
      username: "john",
      status: "away",
      role: "member",
    },
    {
      id: "4",
      name: "GPT-4",
      username: "gpt4-agent",
      status: "offline",
      role: "member", // Agent appears as member
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      <ContentHeader
        title="Projeto"
        description="Gerencie seu projeto e colabore com agentes"
        showMembersToggle={true}
        isMemberSidebarCollapsed={isMemberSidebarCollapsed}
        onToggleMemberSidebar={() =>
          setIsMemberSidebarCollapsed(!isMemberSidebarCollapsed)
        }
      />
      <div className="flex-1 flex">
        {/* Main Project Content */}
        <ScrollArea className="flex-1">
          <main>
            <ProjectView project={project} />
          </main>
        </ScrollArea>

        {/* Members Sidebar */}
        {!isMemberSidebarCollapsed && (
          <div className="w-60">
            <MemberSidebar
              members={mockMembers}
              isCollapsed={isMemberSidebarCollapsed}
              onToggle={() =>
                setIsMemberSidebarCollapsed(!isMemberSidebarCollapsed)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId/")({
  loader: async ({ params }) => {
    const project = await loadApiData(
      () => window.api.projects.findById(params.projectId),
      "Project not found",
    );

    return { project };
  },
  component: ProjectPage,
});
