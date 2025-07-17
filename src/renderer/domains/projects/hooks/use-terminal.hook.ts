import { useTerminalBehavior } from "./use-terminal-behavior.hook";

export function useTerminal() {
  return useTerminalBehavior();
}

export type TerminalState = ReturnType<typeof useTerminal>;
