import { useAgentStore } from "../stores/agent.store";

export function useAgentsState() {
  const selectedAgent = useAgentStore((state) => state.selectedAgent);
  const setSelectedAgent = useAgentStore((state) => state.setSelectedAgent);

  return {
    selectedAgent,
    setSelectedAgent,
  };
}
