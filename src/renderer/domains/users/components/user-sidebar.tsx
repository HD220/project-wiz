import { useState } from "react";

import { ScrollArea } from "@/ui/scroll-area";

import { UserArea } from "./user-area";
import { UserSidebarDirectMessages } from "./user-sidebar-direct-messages";
import { UserSidebarHeader } from "./user-sidebar-header";
import { UserSidebarNavigation } from "./user-sidebar-navigation";
import { UserSidebarSearch } from "./user-sidebar-search";

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
