import { useTerminal } from "./use-terminal.hook";

export function useTerminalPanelState() {
  const terminal = useTerminal();

  return {
    terminal,
  };
}
