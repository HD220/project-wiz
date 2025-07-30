import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";

import {
  MemberSidebar,
  type Member,
} from "@/renderer/components/members/member-sidebar";
import { ContentHeader } from "@/renderer/features/layout/components/content-header";
import {
  Chat,
  ChatContent,
  ChatFooter,
  ChatScrollable,
  ChatInput,
} from "@/renderer/components/chat";
import {
  EmptyState,
  FunctionalChatInput,
  ChatEmpty,
} from "@/renderer/components/chat-components";

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
        <main className="flex-1">
          <Chat className="bg-background">
            <ChatContent>
              <ChatScrollable
                autoScroll={true}
                initScroll={false}
                scrollDelayMs={0}
              >
                <div className="flex-1 flex items-center justify-center">
                  <ChatEmpty>
                    <EmptyState chatType="channel" isArchived={false} />
                  </ChatEmpty>
                </div>
              </ChatScrollable>
            </ChatContent>
            <ChatFooter className="border-t border-border/60 px-4 py-3">
              <ChatInput>
                <FunctionalChatInput
                  onSend={async (content) => {
                    console.log("Send message to channel:", channelId, content);
                    // TODO: Implement channel message sending
                  }}
                  placeholder={`Message # ${channelId}...`}
                />
              </ChatInput>
            </ChatFooter>
          </Chat>
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
