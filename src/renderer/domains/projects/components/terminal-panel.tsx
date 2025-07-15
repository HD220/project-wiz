import { cn } from '../../../../lib/utils';
import { useTerminalState } from '../hooks/use-terminal-state.hook';
import { useTerminalCommands } from '../hooks/use-terminal-commands.hook';
import { TerminalPanelHeader } from './terminal-panel-header';
import { TerminalTabs } from './terminal-tabs';
import { TerminalOutput } from './terminal-output';
import { TerminalInput } from './terminal-input';

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
  const state = useTerminalState();
  const commands = useTerminalCommands({
    command: state.command,
    setCommand: state.setCommand,
    commandHistory: state.commandHistory,
    setCommandHistory: state.setCommandHistory,
    historyIndex: state.historyIndex,
    setHistoryIndex: state.setHistoryIndex,
    terminalLines: state.terminalLines,
    setTerminalLines: state.setTerminalLines,
    setIsRunning: state.setIsRunning,
    scrollAreaRef: state.scrollAreaRef,
  });

  const handleClear = () => {
    state.setTerminalLines([]);
  };

  if (isCollapsed) {
    return (
      <div className={cn("bg-background border rounded-lg", className)}>
        <TerminalPanelHeader onToggleCollapse={onToggleCollapse} onAddTab={state.addTab} />
      </div>
    );
  }

  return (
    <div
      className={cn("bg-background border rounded-lg flex flex-col", className)}
      style={{ height: defaultHeight }}
    >
      <TerminalPanelHeader onToggleCollapse={onToggleCollapse} onAddTab={state.addTab} />
      
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