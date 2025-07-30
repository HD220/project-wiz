import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

import {
  MemberSidebar,
  type Member,
} from "@/renderer/components/members/member-sidebar";
import { ContentHeader } from "@/renderer/components/layout/content-header";
import {
  Chat,
  ChatMessages,
  ChatMessage,
  ChatInput,
} from "@/renderer/components/chat_new";
import { Button } from "@/renderer/components/ui/button";
import { Textarea } from "@/renderer/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";

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

  // Mock empty messages - TODO: Replace with real data from loader
  const mockMessages: any[] = [];

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
          <Chat
            keyFn={(message: any) => message.id}
            value={mockMessages}
            onSend={async (input) => {
              console.log("Send message to channel:", channelId, input);
              // TODO: Implement channel message sending
            }}
            className="bg-background"
          >
            <ChatMessages>
              {(() => {
                // Empty state for channels with no messages
                if (mockMessages.length === 0) {
                  return (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="mb-6">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <span className="text-2xl">#</span>
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            Welcome to # {channelId}!
                          </h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            This is the beginning of your channel. Start
                            discussions with your team and AI agents.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-lg mb-2">👥</div>
                            <h4 className="font-medium text-sm mb-1">
                              Team Collaboration
                            </h4>
                            <p className="text-xs text-mused-foreground">
                              Work together with your team members
                            </p>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-lg mb-2">🤖</div>
                            <h4 className="font-medium text-sm mb-1">
                              AI Integration
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Get assistance from specialized AI agents
                            </p>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-lg mb-2">🎯</div>
                            <h4 className="font-medium text-sm mb-1">
                              Project Focus
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Keep discussions focused on your project
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Render messages when they exist
                return mockMessages.map((message: any, index: number) => (
                  <ChatMessage
                    key={message.id}
                    messageData={message}
                    messageIndex={index}
                    render={(msg) => (
                      <div className="group relative flex gap-3 px-4 py-2 hover:bg-muted/30 transition-colors">
                        {/* Message content - TODO: Implement proper message rendering */}
                        <div className="flex-1">
                          <p className="text-sm">{(msg.data as any).content}</p>
                        </div>
                      </div>
                    )}
                  />
                ));
              })()}
            </ChatMessages>

            <div className="border-t border-border/60 px-4 py-3">
              <ChatInput
                render={(chatInput) => (
                  <FunctionalChatInput
                    value={chatInput.value}
                    loading={chatInput.loading}
                    onValueChange={chatInput.setValue}
                    onSend={chatInput.send}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" && !chatInput.value) {
                        e.preventDefault();
                        chatInput.navigateHistory("up");
                      } else if (e.key === "ArrowDown" && !chatInput.value) {
                        e.preventDefault();
                        chatInput.navigateHistory("down");
                      }
                    }}
                    placeholder={`Message # ${channelId}...`}
                    disabled={false}
                  />
                )}
              />
            </div>
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

// Functional Chat Input Component (shared with DM route)
interface FunctionalChatInputProps {
  value: string;
  loading: boolean;
  onValueChange: (value: string) => void;
  onSend: (value?: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}

function FunctionalChatInput({
  value,
  loading,
  onValueChange,
  onSend,
  onKeyDown,
  placeholder = "Type a message...",
  disabled = false,
}: FunctionalChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (value.trim() && !loading && !disabled) {
      onSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    onKeyDown?.(e);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="min-h-[44px] max-h-[200px] resize-none rounded-lg border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-[44px] w-[44px] p-0"
          disabled={disabled || loading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-[44px] w-[44px] p-0"
          disabled={disabled || loading}
        >
          <Smile className="h-4 w-4" />
        </Button>

        <Button
          type="submit"
          size="sm"
          className="h-[44px] w-[44px] p-0"
          disabled={!value.trim() || loading || disabled}
          onClick={handleSubmit}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export const Route = createFileRoute(
  "/_authenticated/project/$projectId/channel/$channelId",
)({
  component: ChannelLayout,
});
