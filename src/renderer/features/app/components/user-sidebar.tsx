import { SidebarHeader } from "@/renderer/features/app/components/sidebar-header";
import { SidebarNavigation } from "@/renderer/features/app/components/sidebar-navigation";
import { SidebarUserArea } from "@/renderer/features/app/components/sidebar-user-area";

interface UserSidebarProps {
  conversations: any[];
  availableUsers: any[];
  currentUser: any;
  className?: string;
}

function UserSidebar(props: UserSidebarProps) {
  const { conversations, availableUsers, currentUser, className } = props;

  return (
    <div className={`h-full flex flex-col bg-card ${className || ""}`}>
      <SidebarHeader />
      <SidebarNavigation
        conversations={conversations}
        availableUsers={availableUsers}
        currentUser={currentUser}
      />
      <SidebarUserArea />
    </div>
  );
}

export { UserSidebar };
