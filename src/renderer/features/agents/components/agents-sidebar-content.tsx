import { AddAgentModal } from "@/features/projects/components/add-agent-modal";

import { AgentsSidebarMainSection } from "./agents-sidebar-main-section";
import { AgentsSidebarTopSection } from "./agents-sidebar-top-section";

import type { AgentsSidebarContentProps } from "./agents-sidebar-content-props";

export function AgentsSidebarContent({
  projectId,
  agents,
  search,
  modal,
  actions,
  onAgentSelect,
}: AgentsSidebarContentProps) {
  return (
    <>
      <AgentsSidebarTopSection
        projectId={projectId}
        agents={agents}
        search={search}
        onAddClick={() => modal.setIsAddModalOpen(true)}
      />

      <AgentsSidebarMainSection
        projectId={projectId}
        agents={agents}
        searchQuery={search.searchQuery}
        onRemoveAgent={actions.handleRemoveAgent}
        onAddAgent={() => modal.setIsAddModalOpen(true)}
        onAgentSelect={onAgentSelect}
      />

      <AddAgentModal
        isOpen={modal.isAddModalOpen}
        onOpenChange={modal.setIsAddModalOpen}
        projectId={projectId}
        onAgentAdded={actions.handleAgentAdded}
      />
    </>
  );
}
