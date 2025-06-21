// src/infrastructure/ipc-services/ipc-agent-runtime-state-repository.ts
import { IAgentRuntimeStateRepository } from '../../core/ports/repositories/agent-runtime-state.repository.interface';
import { AgentRuntimeState, AgentRuntimeStateProps } from '../../core/domain/entities/agent/agent-runtime-state.entity';
import { AgentId } from '../../core/domain/entities/agent/value-objects'; // AgentRuntimeState uses AgentId as its ID
import { Result, ok, error } from '../../shared/result';
import { DomainError } from '../../core/common/errors';

// Placeholder for sendRequestToMain and rehydrateAgentRuntimeState
declare function sendRequestToMain<T_REQ_PAYLOAD, T_RES_DATA>(type: string, payload: T_REQ_PAYLOAD): Promise<T_RES_DATA>;
declare function rehydrateAgentRuntimeState(plainStateData: any): AgentRuntimeState;

export class IPCAgentRuntimeStateRepository implements IAgentRuntimeStateRepository {
    // AgentRuntimeState's ID is AgentId. The `create` method in IRepository takes props Omit<ConstructorArgs, "id">.
    // The constructor of AgentRuntimeState is `(props: AgentRuntimeStateProps)`, where AgentRuntimeStateProps is `{ agentId: AgentId, ... }`.
    // So, "id" here refers to `agentId` field.
    // `create` should thus take `Omit<AgentRuntimeStateProps, "agentId">`, but this is problematic as agentId is fundamental.
    // Typically, `create` for a state tied to an existing entity (Agent) might not auto-generate an ID in the same way.
    // Let's assume `create` for AgentRuntimeState expects full AgentRuntimeStateProps including agentId.
    // Or, that `IRepository.create`'s `Omit<..., "id">` isn't strictly applied if "id" is not the primary key name.
    // The `AgentRuntimeStateDrizzleRepository`'s `create` method takes `AgentRuntimeStateProps`.
    // For this IPC stub, we'll assume `props` includes `agentId`.
    async create(props: AgentRuntimeStateProps): Promise<Result<AgentRuntimeState>> {
        try {
            const responseData = await sendRequestToMain<AgentRuntimeStateProps, any>('AGENT_RUNTIME_STATE_REPO_CREATE', props);
            if (!responseData) {
                return error(new DomainError("IPCAgentRuntimeStateRepository: Failed to create state, no response data."));
            }
            return ok(rehydrateAgentRuntimeState(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCAgentRuntimeStateRepository.create failed: ${err.message}`));
        }
    }

    async load(id: AgentId): Promise<Result<AgentRuntimeState | null>> {
        try {
            const responseData = await sendRequestToMain<{ id: string }, any>('AGENT_RUNTIME_STATE_REPO_LOAD', { id: id.getValue() });
            if (!responseData) {
                return ok(null);
            }
            return ok(rehydrateAgentRuntimeState(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCAgentRuntimeStateRepository.load failed for AgentID ${id.getValue()}: ${err.message}`));
        }
    }

    async save(state: AgentRuntimeState): Promise<Result<AgentRuntimeState>> {
        try {
            // Assuming AgentRuntimeState entity has a toPlainObject method
            const plainState = (state as any).toPlainObject ? (state as any).toPlainObject() : state;
            const responseData = await sendRequestToMain<{ stateData: any }, any>('AGENT_RUNTIME_STATE_REPO_SAVE', { stateData: plainState });
            if (!responseData) {
                return error(new DomainError(`IPCAgentRuntimeStateRepository: Failed to save state for AgentID ${state.id().getValue()}, no confirmation data.`));
            }
            return ok(rehydrateAgentRuntimeState(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCAgentRuntimeStateRepository.save failed for AgentID ${state.id().getValue()}: ${err.message}`));
        }
    }

    async list(): Promise<Result<AgentRuntimeState[]>> {
        try {
            const responseData = await sendRequestToMain<void, any[]>('AGENT_RUNTIME_STATE_REPO_LIST', undefined);
            if (!responseData) {
                return error(new DomainError("IPCAgentRuntimeStateRepository.list: No response data."));
            }
            return ok(responseData.map(rehydrateAgentRuntimeState));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCAgentRuntimeStateRepository.list failed: ${err.message}`));
        }
    }

    async delete(id: AgentId): Promise<Result<void>> {
        try {
            await sendRequestToMain<{ id: string }, void>('AGENT_RUNTIME_STATE_REPO_DELETE', { id: id.getValue() });
            return ok(undefined);
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCAgentRuntimeStateRepository.delete failed for AgentID ${id.getValue()}: ${err.message}`));
        }
    }
}
