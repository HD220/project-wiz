import { ipcMain } from "electron";

import {
  createAgent,
  findAgentById,
  findAgentByName,
  findAllAgents,
  updateAgent,
  deleteAgent,
  findActiveAgents,
  activateAgent,
  deactivateAgent,
  setDefaultAgent,
  findDefaultAgent,
  findAgentsByLlmProvider,
  agentToDto,
} from "../../../domains/agents/functions";

import type { AgentDto } from "../../../../shared/types/agent.types";

export class AgentIpcHandlers {
  constructor() {}


  registerHandlers(): void {
    // Create agent
    ipcMain.handle("agent:create", async (_, agentData) => {
      try {
        const agent = await createAgent(agentData);
        return agentToDto(agent);
      } catch (error) {
        console.error("Error creating agent:", error);
        throw error;
      }
    });

    // Update agent
    ipcMain.handle("agent:update", async (_, { id, ...updateData }) => {
      try {
        const agent = await updateAgent(id, updateData);
        return agentToDto(agent);
      } catch (error) {
        console.error("Error updating agent:", error);
        throw error;
      }
    });

    // Get agent by ID
    ipcMain.handle("agent:getById", async (_, { id }) => {
      try {
        const agent = await findAgentById(id);
        return agent ? agentToDto(agent) : null;
      } catch (error) {
        console.error("Error getting agent by ID:", error);
        throw error;
      }
    });

    // Get agent by name
    ipcMain.handle("agent:getByName", async (_, { name }) => {
      try {
        const agent = await findAgentByName(name);
        return agent ? agentToDto(agent) : null;
      } catch (error) {
        console.error("Error getting agent by name:", error);
        throw error;
      }
    });

    // List agents
    ipcMain.handle("agent:list", async (_, filter) => {
      try {
        const agents = await findAllAgents(filter);
        return agents.map((agent) => agentToDto(agent));
      } catch (error) {
        console.error("Error listing agents:", error);
        throw error;
      }
    });

    // Get active agents
    ipcMain.handle("agent:listActive", async () => {
      try {
        const agents = await findActiveAgents();
        return agents.map((agent) => agentToDto(agent));
      } catch (error) {
        console.error("Error getting active agents:", error);
        throw error;
      }
    });

    // Delete agent
    ipcMain.handle("agent:delete", async (_, { id }) => {
      try {
        await deleteAgent(id);
        return { success: true };
      } catch (error) {
        console.error("Error deleting agent:", error);
        throw error;
      }
    });

    // Activate agent
    ipcMain.handle("agent:activate", async (_, { id }) => {
      try {
        const agent = await activateAgent(id);
        return agentToDto(agent);
      } catch (error) {
        console.error("Error activating agent:", error);
        throw error;
      }
    });

    // Deactivate agent
    ipcMain.handle("agent:deactivate", async (_, { id }) => {
      try {
        const agent = await deactivateAgent(id);
        return agentToDto(agent);
      } catch (error) {
        console.error("Error deactivating agent:", error);
        throw error;
      }
    });

    // Check if agent exists by name
    ipcMain.handle("agent:existsByName", async (_, { name }) => {
      try {
        const agent = await findAgentByName(name);
        return !!agent;
      } catch (error) {
        console.error("Error checking if agent exists by name:", error);
        throw error;
      }
    });
  }
}
