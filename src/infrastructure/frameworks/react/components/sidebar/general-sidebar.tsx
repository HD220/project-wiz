import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function GeneralSidebar() {
  return (
    <Sidebar
      collapsible="none"
      // variant="sidebar"
      className="!relative [&>[data-slot=sidebar-container]]:relative flex flex-1 w-full"
    >
      <SidebarHeader></SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
