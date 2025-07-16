import { useState, useRef } from "react";
import {
  mockTerminalLines,
  type TerminalLine,
} from "../../../../lib/placeholders";

interface TerminalTab {
  id: number;
  name: string;
  isActive: boolean;
}

export function useTerminalState() {
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: 1, name: "Terminal 1", isActive: true },
  ]);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalLines, setTerminalLines] =
    useState<TerminalLine[]>(mockTerminalLines);
  const [isRunning, setIsRunning] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTab = () => {
    const newTab = {
      id: tabs.length + 1,
      name: `Terminal ${tabs.length + 1}`,
      isActive: false,
    };
    setTabs([...tabs, newTab]);
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
    activeTab,
    setActiveTab,
    tabs,
    command,
    setCommand,
    commandHistory,
    setCommandHistory,
    historyIndex,
    setHistoryIndex,
    terminalLines,
    setTerminalLines,
    isRunning,
    setIsRunning,
    scrollAreaRef,
    inputRef,
    addTab,
    closeTab,
  };
}
