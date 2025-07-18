import { useTerminalState } from "./use-terminal-state.hook";
import { useTerminalCommands } from "./use-terminal-commands.hook";
import { useTerminalTabs } from "./use-terminal-tabs.hook";
import { useTerminalScroll } from "./use-terminal-scroll.hook";

export function useTerminalBehavior() {
  const state = useTerminalState();
  const commands = useTerminalCommands();
  const tabs = useTerminalTabs();
  const scroll = useTerminalScroll(state.scrollAreaRef, state.terminalLines);

  const handleCommand = () => {
    commands.executeCommand(
      state.addLine,
      state.startExecution,
      state.stopExecution,
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleCommand();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      commands.navigateHistoryUp();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      commands.navigateHistoryDown();
    }
  };

  return {
    // Terminal output
    terminalLines: state.terminalLines,
    setTerminalLines: state.setTerminalLines,
    isRunning: state.isRunning,
    scrollAreaRef: state.scrollAreaRef,
    inputRef: state.inputRef,

    // Command handling
    command: commands.command,
    setCommand: commands.setCommand,
    commandHistory: commands.commandHistory,
    historyIndex: commands.historyIndex,
    handleCommand,
    handleKeyDown,

    // Tab management
    activeTab: tabs.activeTab,
    setActiveTab: tabs.setActiveTab,
    tabs: tabs.tabs,
    addTab: tabs.addTab,
    closeTab: tabs.closeTab,

    // Scroll management
    scrollToBottom: scroll.scrollToBottom,
    scrollToTop: scroll.scrollToTop,
    scrollToLine: scroll.scrollToLine,
  };
}
