import { useTerminalCommand } from "./use-terminal-command.hook";
import { useTerminalOutput } from "./use-terminal-output.hook";
import { useTerminalTabs } from "./use-terminal-tabs.hook";

export type TerminalState = ReturnType<typeof useTerminalState>;

export function useTerminalState() {
  const tabs = useTerminalTabs();
  const command = useTerminalCommand();
  const output = useTerminalOutput();

  return {
    ...tabs,
    ...command,
    ...output,
  };
}
