import { useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

import { UserArea } from "../../../users/components/user-area";
import { NavigationHeader } from "./navigation-header";
import { NavigationSearch } from "./navigation-search";
import { NavigationMenuItems } from "./navigation-menu-items";
import { NavigationChannels } from "./navigation-channels";

import type { ChannelDto } from "../../../../shared/types/channel.types";

interface ProjectNavigationProps {
  projectId: string;
  projectName: string;
  channels: ChannelDto[];
  onAddChannel: () => void;
}

export function ProjectNavigation({
  projectName,
  projectId,
  channels,
  onAddChannel,
}: ProjectNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full bg-card border-r border-border flex flex-col h-full overflow-hidden">
      <NavigationHeader projectName={projectName} />
      <NavigationSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2 space-y-1">
          <NavigationMenuItems projectId={projectId} />
          <NavigationChannels
            projectId={projectId}
            channels={filteredChannels}
            onAddChannel={onAddChannel}
          />
        </div>
      </ScrollArea>

      <UserArea />
    </div>
  );
}
