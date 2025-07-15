import { X } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';

interface TerminalTab {
  id: number;
  name: string;
  isActive: boolean;
}

interface TerminalTabsProps {
  tabs: TerminalTab[];
  activeTab: number;
  onTabSelect: (index: number) => void;
  onTabClose: (index: number) => void;
}

export function TerminalTabs({ tabs, activeTab, onTabSelect, onTabClose }: TerminalTabsProps) {
  return (
    <div className="flex border-b bg-background">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer border-r text-sm group hover:bg-accent",
            activeTab === index && "bg-accent text-accent-foreground"
          )}
          onClick={() => onTabSelect(index)}
        >
          <span className="truncate max-w-24">{tab.name}</span>
          
          {tabs.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(index);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}