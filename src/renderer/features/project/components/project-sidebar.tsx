import { Hash, Settings } from "lucide-react";

import type { Project } from "@/shared/types/project";
import type { Channel } from "@/shared/types/channel";

import { MenuItem } from "@/renderer/components/molecules/menu-item";
import { IconButton } from "@/renderer/components/molecules/icon-button";
import { Sidebar, SidebarHeader, SidebarContent, SidebarSection } from "@/renderer/components/organisms/sidebar";
import { List, ListEmpty } from "@/renderer/components/organisms/list";
import { Text } from "@/renderer/components/atoms/text";
import { Icon } from "@/renderer/components/atoms/icon";

interface ProjectSidebarProps {
  project: SelectProject;
  conversations?: SelectConversation[];
  className?: string;
}

export function ProjectSidebar({ 
  project, 
  conversations = [], 
  className 
}: ProjectSidebarProps) {
  
  // Transform conversations into channels
  const channels = conversations.map((conversation) => ({
    id: conversation.id,
    name: conversation.name || "Unnamed Channel",
    hasNotification: false, // TODO: Add notification logic
  }));

  return (
    <Sidebar 
      width="wide"
      className={className}
      role="complementary"
      aria-label={`${project.name} navigation`}
    >
      {/* Project Header */}
      <SidebarHeader
        title={project.name}
        actions={
          <IconButton
            icon={Settings}
            variant="ghost"
            size="sm"
            aria-label="Project settings"
          />
        }
      />

      <SidebarContent>
        {/* Dashboard */}
        <SidebarSection>
          <MenuItem
            to="/project/$projectId"
            params={{ projectId: project.id }}
            icon={Hash}
            label="Dashboard"
            variant="sidebar"
          />
        </SidebarSection>

        {/* Text Channels */}
        <SidebarSection title="Text Channels">
          {channels.length > 0 ? (
            <List spacing="sm">
              {channels.map((channel) => (
                <MenuItem
                  key={channel.id}
                  to="/project/$projectId/channel/$channelId"
                  params={{ 
                    projectId: project.id, 
                    channelId: channel.id 
                  }}
                  icon={Hash}
                  label={channel.name}
                  variant="sidebar"
                  hasNotification={channel.hasNotification}
                />
              ))}
            </List>
          ) : (
            <ListEmpty
              title="No conversations yet"
              description="Start a conversation to see it here"
              icon={<Icon icon={Hash} size="md" color="secondary" />}
            />
          )}
        </SidebarSection>
      </SidebarContent>
    </Sidebar>
  );
}