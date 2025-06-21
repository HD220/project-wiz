// src/infrastructure/ipc-services/ipc-llm-provider-config-repository.ts
import { ILLMProviderConfigRepository } from '../../core/ports/repositories/llm-provider-config.interface';
import { LLMProviderConfig, LLMProviderConfigProps } from '../../core/domain/entities/llm-provider-config/llm-provider-config.entity';
import { LLMProviderConfigId } from '../../core/domain/entities/llm-provider-config/value-objects/llm-provider-config-id.vo';
import { Result, ok, error } from '../../shared/result';
import { DomainError } from '../../core/common/errors';

// Placeholder for sendRequestToMain and rehydrateLLMProviderConfig
declare function sendRequestToMain<T_REQ_PAYLOAD, T_RES_DATA>(type: string, payload: T_REQ_PAYLOAD): Promise<T_RES_DATA>;
declare function rehydrateLLMProviderConfig(plainConfigData: any): LLMProviderConfig;

export class IPCLLMProviderConfigRepository implements ILLMProviderConfigRepository {
    async create(props: Omit<LLMProviderConfigProps, "id">): Promise<Result<LLMProviderConfig>> {
        try {
            const responseData = await sendRequestToMain<Omit<LLMProviderConfigProps, "id">, any>('LLM_PROVIDER_CONFIG_REPO_CREATE', props);
            if (!responseData) {
                return error(new DomainError("IPCLLMProviderConfigRepository: Failed to create config, no response data."));
            }
            return ok(rehydrateLLMProviderConfig(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCLLMProviderConfigRepository.create failed: ${err.message}`));
        }
    }

    async load(id: LLMProviderConfigId): Promise<Result<LLMProviderConfig | null>> {
        try {
            const responseData = await sendRequestToMain<{ id: string }, any>('LLM_PROVIDER_CONFIG_REPO_LOAD', { id: id.getValue() });
            if (!responseData) {
                return ok(null);
            }
            return ok(rehydrateLLMProviderConfig(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCLLMProviderConfigRepository.load failed for ID ${id.getValue()}: ${err.message}`));
        }
    }

    async save(config: LLMProviderConfig): Promise<Result<LLMProviderConfig>> {
        try {
            const plainConfig = (config as any).toPlainObject ? (config as any).toPlainObject() : config;
            const responseData = await sendRequestToMain<{ configData: any }, any>('LLM_PROVIDER_CONFIG_REPO_SAVE', { configData: plainConfig });
            if (!responseData) {
                return error(new DomainError(`IPCLLMProviderConfigRepository: Failed to save config ${config.id().getValue()}, no confirmation data.`));
            }
            return ok(rehydrateLLMProviderConfig(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCLLMProviderConfigRepository.save failed for config ${config.id().getValue()}: ${err.message}`));
        }
    }

    async list(): Promise<Result<LLMProviderConfig[]>> {
        try {
            const responseData = await sendRequestToMain<void, any[]>('LLM_PROVIDER_CONFIG_REPO_LIST', undefined);
            if (!responseData) {
                return error(new DomainError("IPCLLMProviderConfigRepository.list: No response data."));
            }
            return ok(responseData.map(rehydrateLLMProviderConfig));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCLLMProviderConfigRepository.list failed: ${err.message}`));
        }
    }

    async delete(id: LLMProviderConfigId): Promise<Result<void>> {
        try {
            await sendRequestToMain<{ id: string }, void>('LLM_PROVIDER_CONFIG_REPO_DELETE', { id: id.getValue() });
            return ok(undefined);
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCLLMProviderConfigRepository.delete failed for ID ${id.getValue()}: ${err.message}`));
        }
    }
}
