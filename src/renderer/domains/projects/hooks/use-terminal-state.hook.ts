import { useState, useRef } from "react";

import { mockTerminalLines } from "@/lib/mock-data/terminal";

import type { TerminalLine } from "@/lib/mock-data/types";

export function useTerminalState() {
  const [terminalLines, setTerminalLines] =
    useState<TerminalLine[]>(mockTerminalLines);
  const [isRunning, setIsRunning] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addLine = (line: TerminalLine) => {
    setTerminalLines((prev) => [...prev, line]);
  };

  const clearLines = () => {
    setTerminalLines([]);
  };

  const startExecution = () => {
    setIsRunning(true);
  };

  const stopExecution = () => {
    setIsRunning(false);
  };

  const resetTerminal = () => {
    setTerminalLines(mockTerminalLines);
    setIsRunning(false);
  };

  return {
    terminalLines,
    setTerminalLines,
    isRunning,
    scrollAreaRef,
    inputRef,
    addLine,
    clearLines,
    startExecution,
    stopExecution,
    resetTerminal,
  };
}
