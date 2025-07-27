import type { ConversationWithLastMessage } from "@/main/features/conversation/conversation.types";
import type { UserSummary } from "@/main/features/user/user.service";

import { SidebarHeader } from "@/renderer/features/app/components/sidebar-header";
import { SidebarNavigation } from "@/renderer/features/app/components/sidebar-navigation";
import { SidebarUserArea } from "@/renderer/features/app/components/sidebar-user-area";
import { cn } from "@/renderer/lib/utils";

interface UserSidebarProps {
  conversations: ConversationWithLastMessage[];
  availableUsers: UserSummary[];
  className?: string;
}

export function UserSidebar(props: UserSidebarProps) {
  const { conversations, availableUsers, className } = props;

  return (
    <aside
      className={cn(
        "h-full flex flex-col bg-card/50 backdrop-blur-sm",
        className,
      )}
      role="complementary"
      aria-label="User area navigation"
    >
      <SidebarHeader />
      <SidebarNavigation
        conversations={conversations}
        availableUsers={availableUsers}
      />
      <SidebarUserArea />
    </aside>
  );
}
