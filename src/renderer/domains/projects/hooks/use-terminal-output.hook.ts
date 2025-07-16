import { useState, useRef } from "react";

import { mockTerminalLines } from "@/lib/mock-data/terminal";

import type { TerminalLine } from "@/lib/mock-data/types";

export function useTerminalOutput() {
  const [terminalLines, setTerminalLines] =
    useState<TerminalLine[]>(mockTerminalLines);
  const [isRunning, setIsRunning] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return {
    terminalLines,
    setTerminalLines,
    isRunning,
    setIsRunning,
    scrollAreaRef,
    inputRef,
  };
}
