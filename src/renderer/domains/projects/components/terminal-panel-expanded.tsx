import { cn } from "@/lib/utils";

import { TerminalPanelHeader } from "./terminal-panel-header";
import { TerminalOutput } from "./terminal-output";
import { TerminalInput } from "./terminal-input";

import type { TerminalState } from "../hooks/use-terminal.hook";

interface TerminalPanelExpandedProps {
  className?: string;
  defaultHeight?: number;
  onToggleCollapse?: () => void;
  terminal: TerminalState;
}

export function TerminalPanelExpanded({
  className,
  defaultHeight = 300,
  onToggleCollapse,
  terminal,
}: TerminalPanelExpandedProps) {
  return (
    <div
      className={cn("bg-background border rounded-lg", className)}
      style={{ height: defaultHeight }}
    >
      <TerminalPanelHeader
        onToggleCollapse={onToggleCollapse}
        onAddTab={terminal.addTab}
      />
      <TerminalOutput
        terminalLines={terminal.terminalLines}
        scrollAreaRef={terminal.scrollAreaRef}
        isRunning={terminal.isRunning}
      />
      <TerminalInput
        command={terminal.command}
        setCommand={terminal.setCommand}
        handleKeyDown={terminal.handleKeyDown}
        inputRef={terminal.inputRef}
      />
    </div>
  );
}
