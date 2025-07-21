import { SidebarHeader } from "./sidebar-header";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarUserArea } from "./sidebar-user-area";

export function Sidebar() {
  return (
    <div className="h-full flex flex-col bg-card">
      <SidebarHeader />
      <SidebarNavigation />
      <SidebarUserArea />
    </div>
  );
}