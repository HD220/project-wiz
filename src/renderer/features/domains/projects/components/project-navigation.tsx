import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationHeader } from "./navigation-header";
import { NavigationChannels } from "./navigation-channels";
import { NavigationSearch } from "./navigation-search";

interface ProjectNavigationProps {
  projectName: string;
  projectId: string;
  channels: any[];
  onAddChannel: () => void;
}

export function ProjectNavigation({
  projectName,
  projectId,
  channels,
  onAddChannel,
}: ProjectNavigationProps) {
  return (
    <div className="w-full h-full bg-sidebar flex flex-col">
      <NavigationHeader projectName={projectName} />

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            <NavigationSearch />
            <NavigationChannels
              channels={channels}
              projectId={projectId}
              onAddChannel={onAddChannel}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
