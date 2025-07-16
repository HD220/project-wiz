import { useEffect } from "react";
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

export function useTerminalCommands({
  command,
  setCommand,
  commandHistory,
  setCommandHistory,
  historyIndex,
  setHistoryIndex,
  terminalLines,
  setTerminalLines,
  setIsRunning,
  scrollAreaRef,
}: UseTerminalCommandsProps) {
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [terminalLines, scrollAreaRef]);

  const handleCommand = () => {
    if (!command.trim()) return;

    const newLine: TerminalLine = {
      id: Date.now(),
      text: `$ ${command}`,
      type: "command",
      timestamp: new Date(),
    };

    setTerminalLines([...terminalLines, newLine]);
    setCommandHistory([...commandHistory, command]);
    setHistoryIndex(-1);
    setIsRunning(true);

    setTimeout(() => {
      const outputLine: TerminalLine = {
        id: Date.now() + 1,
        text: `Command executed: ${command}`,
        type: "output",
        timestamp: new Date(),
      };
      setTerminalLines((prev) => [...prev, outputLine]);
      setIsRunning(false);
    }, 1000);

    setCommand("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex =
          historyIndex < commandHistory.length - 1 ? historyIndex + 1 : -1;
        setHistoryIndex(newIndex);
        setCommand(newIndex === -1 ? "" : commandHistory[newIndex]);
      }
    }
  };

  return {
    handleCommand,
    handleKeyDown,
  };
}
