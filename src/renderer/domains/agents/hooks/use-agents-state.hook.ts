import { useAgentStore } from "../stores/agent.store";

export function useAgentsState() {
  const selectedAgent = useAgentStore((state: any) => state.selectedAgent);
  const setSelectedAgent = useAgentStore(
    (state: any) => state.setSelectedAgent,
  );

  return {
    selectedAgent,
    setSelectedAgent,
  };
}