import { useState } from "react";

import type { TerminalLine } from "@/lib/mock-data/types";

export function useTerminalCommands() {
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const executeCommand = (
    onAddLine: (line: TerminalLine) => void,
    onStart: () => void,
    onStop: () => void,
  ) => {
    if (!command.trim()) return;

    const inputLine: TerminalLine = {
      id: Date.now().toString(),
      content: `$ ${command}`,
      type: "input",
      timestamp: new Date(),
    };

    onAddLine(inputLine);
    addToHistory(command);
    resetHistoryIndex();
    onStart();

    setTimeout(() => {
      const outputLine: TerminalLine = {
        id: (Date.now() + 1).toString(),
        content: `Command executed: ${command}`,
        type: "output",
        timestamp: new Date(),
      };
      onAddLine(outputLine);
      onStop();
    }, 1000);

    clearCommand();
  };

  const addToHistory = (cmd: string) => {
    setCommandHistory((prev) => [...prev, cmd]);
  };

  const resetHistoryIndex = () => {
    setHistoryIndex(-1);
  };

  const clearCommand = () => {
    setCommand("");
  };

  const navigateHistoryUp = () => {
    if (commandHistory.length === 0) return;

    const newIndex =
      historyIndex === -1
        ? commandHistory.length - 1
        : Math.max(0, historyIndex - 1);

    setHistoryIndex(newIndex);
    setCommand(commandHistory[newIndex]);
  };

  const navigateHistoryDown = () => {
    if (historyIndex === -1) return;

    const newIndex =
      historyIndex < commandHistory.length - 1 ? historyIndex + 1 : -1;

    setHistoryIndex(newIndex);
    setCommand(newIndex === -1 ? "" : commandHistory[newIndex]);
  };

  return {
    command,
    setCommand,
    commandHistory,
    historyIndex,
    executeCommand,
    navigateHistoryUp,
    navigateHistoryDown,
  };
}
