import { useState, useEffect } from "react";

export type SidebarMode = "server" | "user";

interface UseLayoutStateProps {
  selectedProjectId?: string;
}

export function useLayoutState({ selectedProjectId }: UseLayoutStateProps = {}) {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("user");

  useEffect(() => {
    if (selectedProjectId) {
      setSidebarMode("server");
    } else {
      setSidebarMode("user");
    }
  }, [selectedProjectId]);

  const toggleRightPanel = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
  };

  return {
    isRightPanelOpen,
    sidebarMode,
    toggleRightPanel,
    setSidebarMode,
  };
}