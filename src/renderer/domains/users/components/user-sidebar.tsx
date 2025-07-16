import { useState } from "react";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { UserSidebarHeader } from "./user-sidebar-header";
import { UserSidebarSearch } from "./user-sidebar-search";
import { UserSidebarNavigation } from "./user-sidebar-navigation";
import { UserSidebarDirectMessages } from "./user-sidebar-direct-messages";
import { UserArea } from "./user-area";

interface UserSidebarProps {
  className?: string;
}

export function UserSidebar({ className }: UserSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full bg-card border-r border-border flex flex-col h-full overflow-hidden">
      <UserSidebarHeader />
      <UserSidebarSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2 space-y-1">
          <UserSidebarNavigation />
          <UserSidebarDirectMessages />
        </div>
      </ScrollArea>

      <UserArea />
    </div>
  );
}
