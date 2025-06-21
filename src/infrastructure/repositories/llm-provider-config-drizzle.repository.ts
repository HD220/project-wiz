// src/infrastructure/repositories/llm-provider-config-drizzle.repository.ts
import { Result, ok, error } from '@/shared/result';
import { ILLMProviderConfigRepository } from '@/core/ports/repositories/llm-provider-config.interface';
import { LLMProviderConfig, LLMProviderConfigConstructor } from '@/core/domain/entities/llm-provider-config';
import {
    LLMProviderConfigId,
    LLMProviderConfigName,
    LLMProviderConfigApiKey
} from '@/core/domain/entities/llm-provider-config/value-objects';
import { LLMProvider } from '@/core/domain/entities/llm-provider';
import { LLMModel } from '@/core/domain/entities/llm-model';
import { LLMProviderId } from '@/core/domain/entities/llm-provider/value-objects';
import { LLMModelId } from '@/core/domain/entities/llm-model/value-objects';
import {
    llmProviderConfigsTable, // Using the name defined in the schema creation step
    LLMProviderConfigDbInsert,
    LLMProviderConfigDbSelect
} from '../services/drizzle/schemas/llm-provider-configs'; // Adjusted schema import name
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DomainError } from '@/core/common/errors';
import { ILLMProviderRepository } from '@/core/ports/repositories/llm-provider.interface';

// Define a type for the schema that the db instance will expect
type DBSchema = {
    llmProviderConfigsTable: typeof llmProviderConfigsTable;
    // llmProvidersTable might also be needed if joins are done by Drizzle,
    // but llmProviderRepository handles loading the LLMProvider entity.
};

export class LLMProviderConfigDrizzleRepository implements ILLMProviderConfigRepository {
    constructor(
        private readonly db: BetterSQLite3Database<DBSchema>,
        private readonly llmProviderRepository: ILLMProviderRepository // Injected
    ) {}

    private async toEntity(row: LLMProviderConfigDbSelect): Promise<LLMProviderConfig> {
        const llmProviderIdVo = LLMProviderId.create(row.llmProviderId);
        const providerResult = await this.llmProviderRepository.load(llmProviderIdVo);

        if (providerResult.isError() || !providerResult.value) {
            const errMsg = `LLMProvider not found (ID: ${llmProviderIdVo.getValue()}) when trying to load LLMProviderConfig (ID: ${row.id})`;
            console.error(errMsg, providerResult.isError() ? providerResult.message : '');
            throw new DomainError(errMsg); // Throw to be caught by calling method's try/catch
        }
        const llmProvider = providerResult.value;

        const modelIdVo = LLMModelId.create(row.modelId); // LLMModelId.create can take string
        const model = llmProvider.getModelById(modelIdVo);
        if (!model) {
            const errMsg = `LLMModel '${modelIdVo.getValue()}' not found in LLMProvider '${llmProvider.id().getValue()}' for LLMProviderConfig (ID: ${row.id})`;
            console.error(errMsg);
            throw new DomainError(errMsg); // Throw to be caught
        }

        const props: LLMProviderConfigConstructor = {
            id: LLMProviderConfigId.create(row.id),
            name: LLMProviderConfigName.create(row.name),
            apiKey: LLMProviderConfigApiKey.create(row.apiKey),
            llmProvider: llmProvider,
            model: model,
        };
        return LLMProviderConfig.create(props); // Use static create method
    }

    private toPersistence(config: LLMProviderConfig): LLMProviderConfigDbInsert {
        const props = config.getProps();
        return {
            id: config.id().getValue(),
            name: props.name.getValue(),
            apiKey: props.apiKey.getValue(),
            llmProviderId: props.llmProvider.id().getValue(),
            modelId: props.model.id().getValue(),
        };
    }

    async save(config: LLMProviderConfig): Promise<Result<LLMProviderConfig>> {
        try {
            const data = this.toPersistence(config);
            await this.db.insert(llmProviderConfigsTable).values(data)
                .onConflictDoUpdate({ target: llmProviderConfigsTable.id, set: data });
            return ok(config);
        } catch (e) {
            console.error("Error saving LLM provider config:", e);
            return error(new DomainError("Failed to save LLM provider config.", e instanceof Error ? e : undefined));
        }
    }

    async load(id: LLMProviderConfigId): Promise<Result<LLMProviderConfig | null>> {
        try {
            const results = await this.db.select().from(llmProviderConfigsTable)
                .where(eq(llmProviderConfigsTable.id, id.getValue()))
                .limit(1);
            if (results.length === 0) {
                return ok(null);
            }
            // toEntity is async and can throw DomainError if referenced LLMProvider/LLMModel not found
            const entity = await this.toEntity(results[0]);
            return ok(entity);
        } catch (e) {
            // Catch errors from DB query or from toEntity if it throws
            console.error(`Error loading LLM provider config ${id.getValue()}:`, e);
            return error(e instanceof DomainError ? e : new DomainError("Failed to load LLM provider config.", e instanceof Error ? e : undefined));
        }
    }

    async findById(id: LLMProviderConfigId): Promise<Result<LLMProviderConfig | null>> {
        return this.load(id);
    }

    async create(props: Omit<LLMProviderConfigConstructor, "id">): Promise<Result<LLMProviderConfig>> {
        try {
            const id = LLMProviderConfigId.create();
            const fullProps: LLMProviderConfigConstructor = { id, ...props };
            // LLMProviderConfig.create will validate if all required entities/VOs (like llmProvider, model) are present in props
            const config = LLMProviderConfig.create(fullProps);
            return this.save(config);
        } catch (e) {
             console.error("Error creating LLM provider config via repository:", e);
             return error(new DomainError("Failed to create LLM provider config via repository.", e instanceof Error ? e : undefined));
        }
    }

    async update(config: LLMProviderConfig): Promise<Result<LLMProviderConfig>> {
        return this.save(config);
    }

    async list(): Promise<Result<LLMProviderConfig[]>> {
        try {
            const results = await this.db.select().from(llmProviderConfigsTable).all();
            // Need to handle Promise.all for async toEntity, and potential errors from toEntity
            const entitiesPromises = results.map(row => this.toEntity(row));
            const resolvedEntities = await Promise.allSettled(entitiesPromises);

            const validEntities: LLMProviderConfig[] = [];
            const errorsList: DomainError[] = [];

            for (const result of resolvedEntities) {
                if (result.status === 'fulfilled') {
                    validEntities.push(result.value);
                } else {
                    console.error("Error converting row to LLMProviderConfig entity during list:", result.reason);
                    errorsList.push(result.reason instanceof DomainError ? result.reason : new DomainError("Failed to convert a DB row.", result.reason));
                }
            }

            if (errorsList.length > 0 && validEntities.length === 0) { // If all conversions failed
                 return error(new DomainError(`Failed to load any LLM provider configs. First error: ${errorsList[0].message}`));
            }
            // Optionally, if some entities loaded but others failed, log errors and return valid ones
            if (errorsList.length > 0) {
                console.warn(`Some LLMProviderConfigs failed to load during list operation. Loaded ${validEntities.length} successfully.`);
            }
            return ok(validEntities);
        } catch (e) {
            console.error("Error listing LLM provider configs:", e);
            return error(new DomainError("Failed to list LLM provider configs.", e instanceof Error ? e : undefined));
        }
    }

    async delete(id: LLMProviderConfigId): Promise<Result<void>> {
        try {
            const result = await this.db.delete(llmProviderConfigsTable)
                .where(eq(llmProviderConfigsTable.id, id.getValue()))
                .returning({ id: llmProviderConfigsTable.id });

            if (result.length === 0) {
                 return error(new DomainError(`LLMProviderConfig with id ${id.getValue()} not found for deletion.`));
            }
            return ok(undefined);
        } catch (e) {
            console.error(`Error deleting LLM provider config ${id.getValue()}:`, e);
            return error(new DomainError("Failed to delete LLM provider config.", e instanceof Error ? e : undefined));
        }
    }
}
