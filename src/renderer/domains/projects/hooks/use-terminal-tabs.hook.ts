import { useState } from "react";

interface TerminalTab {
  id: number;
  name: string;
  isActive: boolean;
}

export function useTerminalTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: 1, name: "Terminal 1", isActive: true },
  ]);

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

  const switchTab = (index: number) => {
    setActiveTab(index);
  };

  const getActiveTab = () => {
    return tabs[activeTab];
  };

  const getTabCount = () => {
    return tabs.length;
  };

  const canCloseTab = () => {
    return tabs.length > 1;
  };

  return {
    activeTab,
    setActiveTab,
    tabs,
    addTab,
    closeTab,
    switchTab,
    getActiveTab,
    getTabCount,
    canCloseTab,
  };
}
