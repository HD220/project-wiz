interface UseTerminalHistoryProps {
  command: string;
  setCommand: (cmd: string) => void;
  commandHistory: string[];
  historyIndex: number;
  setHistoryIndex: (index: number) => void;
}

export function useTerminalHistory({
  command,
  setCommand,
  commandHistory,
  historyIndex,
  setHistoryIndex,
}: UseTerminalHistoryProps) {
  const handleArrowUp = () => {
    if (commandHistory.length > 0) {
      const newIndex =
        historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setCommand(commandHistory[newIndex]);
    }
  };

  const handleArrowDown = () => {
    if (historyIndex !== -1) {
      const newIndex =
        historyIndex < commandHistory.length - 1 ? historyIndex + 1 : -1;
      setHistoryIndex(newIndex);
      setCommand(newIndex === -1 ? "" : commandHistory[newIndex]);
    }
  };

  return {
    handleArrowUp,
    handleArrowDown,
  };
}