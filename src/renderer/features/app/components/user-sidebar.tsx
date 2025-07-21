import { SidebarHeader } from "./sidebar-header";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarUserArea } from "./sidebar-user-area";

interface UserSidebarProps {
  className?: string;
}

function UserSidebar(props: UserSidebarProps) {
  const { className } = props;

  return (
    <div className={`h-full flex flex-col bg-card ${className || ""}`}>
      <SidebarHeader />
      <SidebarNavigation />
      <SidebarUserArea />
    </div>
  );
}

export { UserSidebar };
