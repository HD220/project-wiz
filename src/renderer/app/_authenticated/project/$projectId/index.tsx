import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  MemberSidebar,
  type Member,
} from "@/renderer/components/members/member-sidebar";
import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { ProjectView } from "@/renderer/features/app/components/server-view";
import { loadApiData } from "@/renderer/lib/route-loader";

function ProjectPage() {
  const { project } = Route.useLoaderData();
  const [isMemberSidebarCollapsed, setIsMemberSidebarCollapsed] =
    useState(false);

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
        <main className="flex-1 overflow-auto">
          <ProjectView project={project} />
        </main>

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
    try {
      const project = await loadApiData(
        () => window.api.projects.findById(params.projectId),
        "Project not found",
      );

      return { project };
    } catch (error) {
      console.error("Failed to load project:", error);
      throw error;
    }
  },
  component: ProjectPage,
});
