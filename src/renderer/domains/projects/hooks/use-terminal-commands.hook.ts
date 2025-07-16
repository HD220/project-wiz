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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      handleArrowUp();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleArrowDown();
    }
  };

  return {
    handleCommand,
    handleKeyDown,
  };
}
