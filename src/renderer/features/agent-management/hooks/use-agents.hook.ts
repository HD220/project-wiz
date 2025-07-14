import { useState, useEffect } from "react";
import type { AgentDto } from "../../../../shared/types/agent.types";

interface UseAgentsReturn {
  agents: AgentDto[];
  activeAgents: AgentDto[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAgent: (agentData: Partial<AgentDto>) => Promise<AgentDto>;
  updateAgent: (id: string, agentData: Partial<AgentDto>) => Promise<AgentDto>;
  deleteAgent: (id: string) => Promise<void>;
  getAgentById: (id: string) => Promise<AgentDto | null>;
  getAgentByName: (name: string) => Promise<AgentDto | null>;
}

export const useAgents = (): UseAgentsReturn => {
  const [agents, setAgents] = useState<AgentDto[]>([]);
  const [activeAgents, setActiveAgents] = useState<AgentDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allAgents = await window.electronIPC.invoke("agent:list");
      const activeAgentsList =
        await window.electronIPC.invoke("agent:listActive");

      setAgents(Array.isArray(allAgents) ? allAgents : []);
      setActiveAgents(Array.isArray(activeAgentsList) ? activeAgentsList : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar agentes");
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (
    agentData: Partial<AgentDto>,
  ): Promise<AgentDto> => {
    try {
      const newAgent = await window.electronIPC.invoke(
        "agent:create",
        agentData,
      );
      await fetchAgents(); // Refresh the list
      return newAgent as AgentDto;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar agente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateAgent = async (
    id: string,
    agentData: Partial<AgentDto>,
  ): Promise<AgentDto> => {
    try {
      const updatedAgent = await window.electronIPC.invoke("agent:update", {
        id,
        ...agentData,
      });
      await fetchAgents(); // Refresh the list
      return updatedAgent as AgentDto;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar agente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAgent = async (id: string): Promise<void> => {
    try {
      await window.electronIPC.invoke("agent:delete", { id });
      await fetchAgents(); // Refresh the list
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar agente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getAgentById = async (id: string): Promise<AgentDto | null> => {
    try {
      return await window.electronIPC.invoke("agent:getById", { id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar agente");
      return null;
    }
  };

  const getAgentByName = async (name: string): Promise<AgentDto | null> => {
    try {
      return await window.electronIPC.invoke("agent:getByName", { name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar agente");
      return null;
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    activeAgents,
    isLoading,
    error,
    refetch: fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    getAgentById,
    getAgentByName,
  };
};
