import { Hash, Bot, Archive } from "lucide-react";



import { MenuItem } from "@/renderer/components/molecules/menu-item";
import { Sidebar, SidebarContent, SidebarSection } from "@/renderer/components/organisms/sidebar";
import { Button } from "@/renderer/components/atoms/button";
import { Icon } from "@/renderer/components/atoms/icon";
import { Text } from "@/renderer/components/atoms/text";
import { ConversationList } from "@/renderer/features/conversation/components/conversation-list";

interface UserSidebarProps {
  conversations: ConversationWithLastMessage[];
  availableUsers: UserSummary[];
  showArchived?: boolean;
  onToggleArchived?: (show: boolean) => void;
}

export function UserSidebar({ 
  conversations, 
  showArchived = false,
  onToggleArchived 
}: UserSidebarProps) {
  
  return (
    <Sidebar 
      width="wide"
      role="navigation"
      aria-label="User navigation"
    >
      <SidebarContent>
        {/* Navigation */}
        <SidebarSection>
          <MenuItem
            to="/user"
            icon={Hash}
            label="Dashboard"
            variant="sidebar"
          />
          
          <MenuItem
            to="/user/agents"
            icon={Bot}
            label="Agents"
            variant="sidebar"
          />
        </SidebarSection>

        {/* Archive Toggle */}
        <SidebarSection>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8 px-2 bg-sidebar-accent/20 hover:bg-sidebar-accent/30 transition-colors"
            onClick={() => onToggleArchived?.(!showArchived)}
          >
            <Icon 
              icon={Archive} 
              size="sm" 
              color="secondary" 
              className="mr-3" 
            />
            <Text size="sm" color="secondary" className="flex-1">
              Show Archived
            </Text>
            
            {/* Simple toggle indicator */}
            <div className={`w-3 h-3 rounded-full transition-colors ${
              showArchived ? 'bg-primary' : 'bg-gray-300'
            }`} />
          </Button>
        </SidebarSection>

        {/* Conversations */}
        <SidebarSection>
          <ConversationList
            conversations={conversations}
            showArchived={showArchived}
          />
        </SidebarSection>
      </SidebarContent>
    </Sidebar>
  );
}