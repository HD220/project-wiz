import { Dispatch, SetStateAction } from "react";

import type { TerminalLine } from "@/lib/mock-data/types";

interface UseTerminalExecutionProps {
  command: string;
  setCommand: (cmd: string) => void;
  commandHistory: string[];
  setCommandHistory: (history: string[]) => void;
  setHistoryIndex: (index: number) => void;
  terminalLines: TerminalLine[];
  setTerminalLines: Dispatch<SetStateAction<TerminalLine[]>>;
  setIsRunning: (running: boolean) => void;
}

export function useTerminalExecution({
  command,
  setCommand,
  commandHistory,
  setCommandHistory,
  setHistoryIndex,
  terminalLines,
  setTerminalLines,
  setIsRunning,
}: UseTerminalExecutionProps) {
  const handleCommand = () => {
    if (!command.trim()) return;

    const newLine: TerminalLine = {
      id: Date.now().toString(),
      content: `$ ${command}`,
      type: "input",
      timestamp: new Date(),
    };

    setTerminalLines([...terminalLines, newLine]);
    setCommandHistory([...commandHistory, command]);
    setHistoryIndex(-1);
    setIsRunning(true);

    setTimeout(() => {
      const outputLine: TerminalLine = {
        id: (Date.now() + 1).toString(),
        content: `Command executed: ${command}`,
        type: "output",
        timestamp: new Date(),
      };
      setTerminalLines((prev: TerminalLine[]) => [...prev, outputLine]);
      setIsRunning(false);
    }, 1000);

    setCommand("");
  };

  return { handleCommand };
}
