import { useTerminalExecution } from "./use-terminal-execution.hook";
import { useTerminalHistory } from "./use-terminal-history.hook";
import { useTerminalScroll } from "./use-terminal-scroll.hook";

import type { TerminalLine } from "../../../../lib/placeholders";

interface UseTerminalCommandsProps {
  command: string;
  setCommand: (cmd: string) => void;
  commandHistory: string[];
  setCommandHistory: (history: string[]) => void;
  historyIndex: number;
  setHistoryIndex: (index: number) => void;
  terminalLines: TerminalLine[];
  setTerminalLines: (lines: TerminalLine[]) => void;
  setIsRunning: (running: boolean) => void;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}

export type TerminalCommands = ReturnType<typeof useTerminalCommands>;

export function useTerminalCommands(props: UseTerminalCommandsProps) {
  useTerminalScroll({
    terminalLines: props.terminalLines,
    scrollAreaRef: props.scrollAreaRef,
  });

  const { handleArrowUp, handleArrowDown } = useTerminalHistory(props);
  const { handleCommand } = useTerminalExecution(props);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleCommand();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      handleArrowUp();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      handleArrowDown();
    }
  };

  return {
    handleCommand,
    handleKeyDown,
  };
}
