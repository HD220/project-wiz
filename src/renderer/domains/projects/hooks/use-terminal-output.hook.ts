import { useState, useRef } from "react";

import {
  mockTerminalLines,
  type TerminalLine,
} from "../../../lib/placeholders";

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
