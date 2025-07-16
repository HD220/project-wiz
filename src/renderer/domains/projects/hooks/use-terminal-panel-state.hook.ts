import { useTerminalCommands } from "./use-terminal-commands.hook";
import { useTerminalState } from "./use-terminal-state.hook";

export function useTerminalPanelState() {
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

  return {
    state,
    commands,
  };
}
