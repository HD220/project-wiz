import { SidebarHeader } from "@/renderer/features/app/components/sidebar-header";
import { SidebarNavigation } from "@/renderer/features/app/components/sidebar-navigation";
import { SidebarUserArea } from "@/renderer/features/app/components/sidebar-user-area";

interface UserSidebarProps {
  conversations: any[];
  availableUsers: any[];
  className?: string;
}

function UserSidebar(props: UserSidebarProps) {
  const { conversations, availableUsers, className } = props;

  return (
    <div className={`h-full flex flex-col bg-card ${className || ""}`}>
      <SidebarHeader />
      <SidebarNavigation
        conversations={conversations}
        availableUsers={availableUsers}
      />
      <SidebarUserArea />
    </div>
  );
}

export { UserSidebar };
