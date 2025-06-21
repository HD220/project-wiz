// src/infrastructure/ipc-services/ipc-agent-repository.ts
import { IAgentRepository } from '../../core/ports/repositories/agent.interface';
import { Agent, AgentProps } from '../../core/domain/entities/agent/agent.entity'; // Assuming AgentProps exists or is similar to JobProps
import { AgentId } from '../../core/domain/entities/agent/value-objects';
import { Result, ok, error } from '../../shared/result';
import { DomainError } from '../../core/common/errors';

// Placeholder for sendRequestToMain and rehydrateAgent
// These will be defined/injected in the worker context (job-processor.worker.ts)
declare function sendRequestToMain<T_REQ_PAYLOAD, T_RES_DATA>(type: string, payload: T_REQ_PAYLOAD): Promise<T_RES_DATA>;
declare function rehydrateAgent(plainAgentData: any): Agent; // Assumes rehydrateAgent is globally available or passed

export class IPCAgentRepository implements IAgentRepository {
    async create(props: Omit<AgentProps, "id">): Promise<Result<Agent>> {
        try {
            // Assuming AgentProps is the type for constructor/create method of Agent entity
            const responseData = await sendRequestToMain<Omit<AgentProps, "id">, any>('AGENT_REPO_CREATE', props);
            if (!responseData) {
                return error(new DomainError("IPCAgentRepository: Failed to create agent, no response data."));
            }
            return ok(rehydrateAgent(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCAgentRepository.create failed: ${err.message}`));
        }
    }

    async load(id: AgentId): Promise<Result<Agent | null>> {
        try {
            const responseData = await sendRequestToMain<{ id: string }, any>('AGENT_REPO_LOAD', { id: id.getValue() });
            if (!responseData) {
                return ok(null);
            }
            return ok(rehydrateAgent(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCAgentRepository.load failed for ID ${id.getValue()}: ${err.message}`));
        }
    }

    async save(agent: Agent): Promise<Result<Agent>> {
        try {
            // Assuming Agent entity has a toPlainObject method similar to Job
            const plainAgent = (agent as any).toPlainObject ? (agent as any).toPlainObject() : agent;
            const responseData = await sendRequestToMain<{ agentData: any }, any>('AGENT_REPO_SAVE', { agentData: plainAgent });
            if (!responseData) {
                return error(new DomainError(`IPCAgentRepository: Failed to save agent ${agent.id().getValue()}, no confirmation data.`));
            }
            return ok(rehydrateAgent(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCAgentRepository.save failed for agent ${agent.id().getValue()}: ${err.message}`));
        }
    }

    async list(): Promise<Result<Agent[]>> {
        try {
            const responseData = await sendRequestToMain<void, any[]>('AGENT_REPO_LIST', undefined);
            if (!responseData) {
                return error(new DomainError("IPCAgentRepository.list: No response data."));
            }
            return ok(responseData.map(rehydrateAgent));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCAgentRepository.list failed: ${err.message}`));
        }
    }

    async delete(id: AgentId): Promise<Result<void>> {
        try {
            await sendRequestToMain<{ id: string }, void>('AGENT_REPO_DELETE', { id: id.getValue() });
            return ok(undefined);
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCAgentRepository.delete failed for ID ${id.getValue()}: ${err.message}`));
        }
    }
}
