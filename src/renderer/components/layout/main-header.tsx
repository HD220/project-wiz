import { Users, X } from "lucide-react";

import { usePageTitle } from "@/renderer/contexts/page-title-context";

import { Button } from "@/components/ui/button";

interface MainHeaderProps {
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
}

export function MainHeader({
  isRightPanelOpen,
  onToggleRightPanel,
}: MainHeaderProps) {
  const { title, icon } = usePageTitle();

  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        {title && (
          <h1 className="font-semibold text-foreground truncate">{title}</h1>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleRightPanel}
        className="w-8 h-8"
      >
        {isRightPanelOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Users className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
