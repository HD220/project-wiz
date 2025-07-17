import { useTerminalPanelState } from "../hooks/use-terminal-panel-state.hook";

import { TerminalPanelCollapsed } from "./terminal-panel-collapsed";
import { TerminalPanelExpanded } from "./terminal-panel-expanded";

interface TerminalPanelProps {
  className?: string;
  defaultHeight?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function TerminalPanel({
  className,
  defaultHeight = 300,
  isCollapsed = false,
  onToggleCollapse,
}: TerminalPanelProps) {
  const { terminal } = useTerminalPanelState();

  if (isCollapsed) {
    return (
      <TerminalPanelCollapsed
        className={className}
        onToggleCollapse={onToggleCollapse}
        onAddTab={terminal.addTab}
      />
    );
  }

  return (
    <TerminalPanelExpanded
      className={className}
      defaultHeight={defaultHeight}
      onToggleCollapse={onToggleCollapse}
      terminal={terminal}
    />
  );
}
