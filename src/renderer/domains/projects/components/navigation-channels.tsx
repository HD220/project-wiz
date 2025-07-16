import { Hash, ChevronDown, Plus } from "lucide-react";

import { CustomLink } from "@/components/custom-link";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import type { ChannelDto } from "../../../../shared/types/channel.types";

interface NavigationChannelsProps {
  projectId: string;
  channels: ChannelDto[];
  onAddChannel: () => void;
}

export function NavigationChannels({
  projectId,
  channels,
  onAddChannel,
}: NavigationChannelsProps) {
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start px-1 py-1 h-auto group"
        >
          <ChevronDown className="w-3 h-3 mr-1" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Canais de Texto
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onAddChannel();
            }}
            className="ml-auto w-4 h-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-accent"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 mt-1">
        {channels.map((channel) => (
          <CustomLink
            key={channel.id}
            to="/project/$projectId/chat/$channelId"
            params={{ projectId, channelId: channel.id }}
            className="w-full justify-start px-2 py-1.5 h-auto"
            activeProps={{
              className: "bg-secondary text-secondary-foreground",
            }}
          >
            <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="truncate">{channel.name}</span>
          </CustomLink>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
