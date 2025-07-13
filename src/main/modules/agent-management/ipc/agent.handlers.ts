import { ipcMain } from "electron";
import { AgentService } from "../application/agent.service";
import { AgentMapper } from "../agent.mapper";
import type { AgentDto } from "../../../../shared/types/agent.types";

export class AgentIpcHandlers {
  constructor(
    private agentService: AgentService,
    private agentMapper: AgentMapper,
  ) {}

  private mapAgentToDto(agent: any): AgentDto {
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      goal: agent.goal,
      backstory: agent.backstory,
      llmProviderId: agent.llmProviderId,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      isActive: agent.isActive,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }

  registerHandlers(): void {
    // Create agent
    ipcMain.handle("agent:create", async (_, agentData) => {
      try {
        const agent = await this.agentService.createAgent(agentData);
        return this.mapAgentToDto(agent);
      } catch (error) {
        console.error("Error creating agent:", error);
        throw error;
      }
    });

    // Update agent
    ipcMain.handle("agent:update", async (_, { id, ...updateData }) => {
      try {
        const agent = await this.agentService.updateAgent(id, updateData);
        return this.mapAgentToDto(agent);
      } catch (error) {
        console.error("Error updating agent:", error);
        throw error;
      }
    });

    // Get agent by ID
    ipcMain.handle("agent:getById", async (_, { id }) => {
      try {
        const agent = await this.agentService.getAgentById(id);
        return agent ? this.mapAgentToDto(agent) : null;
      } catch (error) {
        console.error("Error getting agent by ID:", error);
        throw error;
      }
    });

    // Get agent by name
    ipcMain.handle("agent:getByName", async (_, { name }) => {
      try {
        const agent = await this.agentService.getAgentByName(name);
        return agent ? this.mapAgentToDto(agent) : null;
      } catch (error) {
        console.error("Error getting agent by name:", error);
        throw error;
      }
    });

    // List agents
    ipcMain.handle("agent:list", async (_, filter) => {
      try {
        const agents = await this.agentService.listAgents(filter);
        return agents.map(agent => this.mapAgentToDto(agent));
      } catch (error) {
        console.error("Error listing agents:", error);
        throw error;
      }
    });

    // Get active agents
    ipcMain.handle("agent:listActive", async () => {
      try {
        const agents = await this.agentService.getActiveAgents();
        return agents.map(agent => this.mapAgentToDto(agent));
      } catch (error) {
        console.error("Error getting active agents:", error);
        throw error;
      }
    });

    // Delete agent
    ipcMain.handle("agent:delete", async (_, { id }) => {
      try {
        await this.agentService.deleteAgent(id);
        return { success: true };
      } catch (error) {
        console.error("Error deleting agent:", error);
        throw error;
      }
    });

    // Activate agent
    ipcMain.handle("agent:activate", async (_, { id }) => {
      try {
        const agent = await this.agentService.activateAgent(id);
        return this.mapAgentToDto(agent);
      } catch (error) {
        console.error("Error activating agent:", error);
        throw error;
      }
    });

    // Deactivate agent
    ipcMain.handle("agent:deactivate", async (_, { id }) => {
      try {
        const agent = await this.agentService.deactivateAgent(id);
        return this.mapAgentToDto(agent);
      } catch (error) {
        console.error("Error deactivating agent:", error);
        throw error;
      }
    });

    // Check if agent exists by name
    ipcMain.handle("agent:existsByName", async (_, { name }) => {
      try {
        return await this.agentService.existsByName(name);
      } catch (error) {
        console.error("Error checking if agent exists by name:", error);
        throw error;
      }
    });
  }
}