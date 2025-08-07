import { Hash, Bot, Archive } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/renderer/components/ui/sidebar";
import { ConversationList } from "@/renderer/features/conversation/components/conversation-list";

import type { DMConversation } from "@/shared/types/dm-conversation";
import type { Message } from "@/shared/types/message";
import type { User } from "@/shared/types/user";

// Define types locally since they're not available from imports
interface DMConversationWithLastMessage extends DMConversation {
  lastMessage?: Message;
  participants?: User[];
}

interface UserSidebarProps {
  conversations: DMConversationWithLastMessage[];
  availableUsers: User[];
  showArchived?: boolean;
  onToggleArchived?: (show: boolean) => void;
}

export function UserSidebar({
  conversations,
  availableUsers,
  showArchived = false,
  onToggleArchived,
}: UserSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/user">
                  <Hash className="h-4 w-4" />
                  <span>Dashboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/user/agents">
                  <Bot className="h-4 w-4" />
                  <span>Agents</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Archive Toggle */}
        <SidebarGroup>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8 px-2"
            onClick={() => onToggleArchived?.(!showArchived)}
          >
            <Archive className="h-4 w-4 mr-2" />
            <span className="flex-1">Show Archived</span>

            {/* Simple toggle indicator */}
            <div
              className={`w-3 h-3 rounded-full transition-colors ${
                showArchived ? "bg-primary" : "bg-gray-300"
              }`}
            />
          </Button>
        </SidebarGroup>

        {/* Conversations */}
        <SidebarGroup>
          <ConversationList
            conversations={conversations}
            availableUsers={availableUsers}
          />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
