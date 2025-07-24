import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import {
  MemberSidebar,
  type Member,
} from "@/renderer/components/members/member-sidebar";
import { Users } from "lucide-react";

function ChannelLayout() {
  const { channelId } = Route.useParams();
  const [isMemberSidebarCollapsed, setIsMemberSidebarCollapsed] =
    useState(false);

  // Mock members data - TODO: Replace with real data from loader
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
      name: "John Developer",
      username: "john",
      status: "online",
      role: "member",
    },
    {
      id: "3",
      name: "Sarah",
      username: "sarah",
      status: "away",
      role: "member",
    },
    {
      id: "4",
      name: "Mike",
      username: "mike",
      status: "offline",
      role: "member",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      <ContentHeader
        title={`# ${channelId}`}
        description="Canal de comunicação do projeto"
        showMembersToggle={true}
        isMemberSidebarCollapsed={isMemberSidebarCollapsed}
        onToggleMemberSidebar={() =>
          setIsMemberSidebarCollapsed(!isMemberSidebarCollapsed)
        }
      />
      <div className="flex-1 flex">
        {/* Main Channel Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full p-4">
            <div className="text-center text-muted-foreground">
              <p>
                Você está no canal: <strong>{channelId}</strong>
              </p>
              <p className="text-sm mt-2">
                Implementação do chat será adicionada aqui.
              </p>
            </div>
          </div>
          {/* Child Routes */}
          <Outlet />
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

export const Route = createFileRoute(
  "/_authenticated/project/$projectId/channel/$channelId",
)({
  component: ChannelLayout,
});
