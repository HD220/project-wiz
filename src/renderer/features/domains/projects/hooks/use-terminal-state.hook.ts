import { useState, useRef, useMemo } from "react";
import { useDefaultTerminalSessions } from "./use-terminal-sessions.hook";
import type { TerminalLine } from "@/shared/types/domains/projects/terminal.types";

export function useTerminalState() {
  const { data: defaultSessions, isLoading } = useDefaultTerminalSessions();
  const [isRunning, setIsRunning] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const terminalLines = useMemo(() => {
    if (!defaultSessions || defaultSessions.length === 0) return [];
    return defaultSessions[0]?.lines || [];
  }, [defaultSessions]);

  const setTerminalLines = (
    lines: TerminalLine[] | ((prev: TerminalLine[]) => TerminalLine[]),
  ) => {
    // This is a placeholder - in a real implementation, this would update the session
    console.log("Terminal lines updated:", lines);
  };

  const addLine = (line: TerminalLine) => {
    // This is a placeholder - in a real implementation, this would add to the session
    console.log("Line added:", line);
  };

  const clearLines = () => {
    // This is a placeholder - in a real implementation, this would clear the session
    console.log("Lines cleared");
  };

  const startExecution = () => {
    setIsRunning(true);
  };

  const stopExecution = () => {
    setIsRunning(false);
  };

  const resetTerminal = () => {
    // This is a placeholder - in a real implementation, this would reset the session
    console.log("Terminal reset");
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
    isLoading,
  };
}
