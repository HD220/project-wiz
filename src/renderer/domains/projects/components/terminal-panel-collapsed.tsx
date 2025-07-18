import { cn } from "../../../lib/utils";

import { TerminalPanelHeader } from "./terminal-panel-header";

interface TerminalPanelCollapsedProps {
  className?: string;
  onToggleCollapse?: () => void;
  onAddTab: () => void;
}

export function TerminalPanelCollapsed({
  className,
  onToggleCollapse,
  onAddTab,
}: TerminalPanelCollapsedProps) {
  return (
    <div className={cn("bg-background border rounded-lg", className)}>
      <TerminalPanelHeader
        onToggleCollapse={onToggleCollapse}
        onAddTab={onAddTab}
      />
    </div>
  );
}
