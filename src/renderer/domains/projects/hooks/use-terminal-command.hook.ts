import { useState } from "react";

export function useTerminalCommand() {
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  return {
    command,
    setCommand,
    commandHistory,
    setCommandHistory,
    historyIndex,
    setHistoryIndex,
  };
}
