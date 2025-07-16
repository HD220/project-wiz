import { cn } from "../../../../lib/utils";
import { TerminalPanelHeader } from "./terminal-panel-header";
import { TerminalTabs } from "./terminal-tabs";
import { TerminalOutput } from "./terminal-output";
import { TerminalInput } from "./terminal-input";
import type { TerminalState } from "../hooks/use-terminal-state.hook";
import type { TerminalCommands } from "../hooks/use-terminal-commands.hook";

interface TerminalPanelExpandedProps {
  className?: string;
  defaultHeight: number;
  onToggleCollapse?: () => void;
  state: TerminalState;
  commands: TerminalCommands;
}

export function TerminalPanelExpanded({
  className,
  defaultHeight,
  onToggleCollapse,
  state,
  commands,
}: TerminalPanelExpandedProps) {
  const handleClear = () => {
    state.setTerminalLines([]);
  };

  return (
    <div
      className={cn("bg-background border rounded-lg flex flex-col", className)}
      style={{ height: defaultHeight }}
    >
      <TerminalPanelHeader
        onToggleCollapse={onToggleCollapse}
        onAddTab={state.addTab}
      />

      <TerminalTabs
        tabs={state.tabs}
        activeTab={state.activeTab}
        onTabSelect={state.setActiveTab}
        onTabClose={state.closeTab}
      />

      <TerminalOutput
        terminalLines={state.terminalLines}
        isRunning={state.isRunning}
        scrollAreaRef={state.scrollAreaRef}
      />

      <TerminalInput
        command={state.command}
        setCommand={state.setCommand}
        onSubmit={commands.handleCommand}
        onKeyDown={commands.handleKeyDown}
        onClear={handleClear}
        isRunning={state.isRunning}
        inputRef={state.inputRef}
      />
    </div>
  );
}