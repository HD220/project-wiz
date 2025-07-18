import { useState } from "react";

export function useAgentsSidebarState() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return {
    searchQuery,
    setSearchQuery,
    isAddModalOpen,
    setIsAddModalOpen,
  };
}
