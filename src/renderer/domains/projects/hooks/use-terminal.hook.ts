import { useState, useRef, useEffect } from "react";

import { mockTerminalLines } from "@/lib/mock-data/terminal";

import type { TerminalLine } from "@/lib/mock-data/types";

interface TerminalTab {
  id: number;
  name: string;
  isActive: boolean;
}

export function useTerminal() {
  // Terminal state
  const [terminalLines, setTerminalLines] =
    useState<TerminalLine[]>(mockTerminalLines);
  const [isRunning, setIsRunning] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Command state
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: 1, name: "Terminal 1", isActive: true },
  ]);

  // Auto-scroll effect
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [terminalLines]);

  // Terminal commands
  const handleCommand = () => {
    if (!command.trim()) return;

    const newLine: TerminalLine = {
      id: Date.now().toString(),
      content: `$ ${command}`,
      type: "input",
      timestamp: new Date(),
    };

    setTerminalLines((prev) => [...prev, newLine]);
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);
    setIsRunning(true);

    setTimeout(() => {
      const outputLine: TerminalLine = {
        id: (Date.now() + 1).toString(),
        content: `Command executed: ${command}`,
        type: "output",
        timestamp: new Date(),
      };
      setTerminalLines((prev) => [...prev, outputLine]);
      setIsRunning(false);
    }, 1000);

    setCommand("");
  };

  // History navigation
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

  // Key handling
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleCommand();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      handleArrowUp();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      handleArrowDown();
    }
  };

  // Tab management
  const addTab = () => {
    const newTab = {
      id: tabs.length + 1,
      name: `Terminal ${tabs.length + 1}`,
      isActive: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(tabs.length);
  };

  const closeTab = (index: number) => {
    if (tabs.length <= 1) return;

    const newTabs = tabs.filter((_, i) => i !== index);
    setTabs(newTabs);

    if (index === activeTab) {
      setActiveTab(Math.max(0, index - 1));
    } else if (index < activeTab) {
      setActiveTab(activeTab - 1);
    }
  };

  return {
    // Terminal output
    terminalLines,
    setTerminalLines,
    isRunning,
    scrollAreaRef,
    inputRef,

    // Command handling
    command,
    setCommand,
    commandHistory,
    historyIndex,
    handleCommand,
    handleKeyDown,

    // Tab management
    activeTab,
    setActiveTab,
    tabs,
    addTab,
    closeTab,
  };
}

export type TerminalState = ReturnType<typeof useTerminal>;
