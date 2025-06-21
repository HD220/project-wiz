// src/infrastructure/repositories/llm-provider-drizzle.repository.ts
import { Result, ok, error } from '@/shared/result';
import { ILLMProviderRepository } from '@/core/ports/repositories/llm-provider.interface';
import { LLMProvider, LLMProviderConstructor } from '@/core/domain/entities/llm-provider';
import {
    LLMProviderId,
    LLMProviderName,
    LLMProviderSlug
} from '@/core/domain/entities/llm-provider/value-objects';
import { LLMModel, LLMModelConstructor } from '@/core/domain/entities/llm-model';
import {
    LLMModelId,
    LLMModelName,
    LLMModelSlug
} from '@/core/domain/entities/llm-model/value-objects';
import { llmProvidersTable, LLMProviderDbInsert, LLMProviderDbSelect } from '../services/drizzle/schemas/llm-providers';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DomainError } from '@/core/common/errors';

// Type for the primitive props of LLMModel used for serialization/deserialization
type LLMModelPrimitiveProps = {
    id: string; // Assuming LLMModelId.create takes string and Identity handles string | number
    name: string;
    slug: string;
};

// Define a type for the schema that the db instance will expect
type DBSchema = { llmProvidersTable: typeof llmProvidersTable; /* ... other tables ... */ };

export class LLMProviderDrizzleRepository implements ILLMProviderRepository {
    constructor(private readonly db: BetterSQLite3Database<DBSchema>) {}

    private modelsToPersistence(models: LLMModel[]): LLMModelPrimitiveProps[] {
        return models.map(model => {
            const props = model.getProps(); // LLMModel.getProps() returns LLMModelConstructor (with VOs)
            return {
                id: model.id().getValue(),
                name: props.name.getValue(),
                slug: props.slug.getValue(),
            };
        });
    }

    private modelsToEntity(modelPropsArray: LLMModelPrimitiveProps[]): LLMModel[] {
        return modelPropsArray.map(props => {
            // LLMModel.create expects LLMModelConstructor (which contains VOs)
            const modelConstructorProps: LLMModelConstructor = {
                id: LLMModelId.create(props.id), // LLMModelId.create now takes string
                name: LLMModelName.create(props.name),
                slug: LLMModelSlug.create(props.slug),
            };
            return LLMModel.create(modelConstructorProps);
        });
    }

    private toEntity(row: LLMProviderDbSelect): LLMProvider {
        // The 'models' property from the DB row is already LLMModelPrimitiveProps[]
        // due to Drizzle's .$type<LLMModelPrimitiveProps[]>() in the schema.
        const models = row.models ? this.modelsToEntity(row.models) : [];

        const props: LLMProviderConstructor = {
            id: LLMProviderId.create(row.id),
            name: LLMProviderName.create(row.name),
            slug: LLMProviderSlug.create(row.slug),
            models: models,
        };
        return LLMProvider.create(props); // Use static create method of LLMProvider
    }

    private toPersistence(provider: LLMProvider): LLMProviderDbInsert {
        const props = provider.getProps(); // LLMProvider.getProps() returns LLMProviderConstructor
        return {
            id: provider.id().getValue(),
            name: props.name.getValue(),
            slug: props.slug.getValue(),
            models: this.modelsToPersistence(props.models), // props.models is LLMModel[]
        };
    }

    async save(provider: LLMProvider): Promise<Result<LLMProvider>> {
        try {
            const data = this.toPersistence(provider);
            await this.db.insert(llmProvidersTable).values(data)
                .onConflictDoUpdate({ target: llmProvidersTable.id, set: data });
            return ok(provider);
        } catch (e) {
            console.error("Error saving LLM provider:", e);
            return error(new DomainError("Failed to save LLM provider.", e instanceof Error ? e : undefined));
        }
    }

    async load(id: LLMProviderId): Promise<Result<LLMProvider | null>> {
        try {
            const results = await this.db.select().from(llmProvidersTable)
                .where(eq(llmProvidersTable.id, id.getValue()))
                .limit(1);
            if (results.length === 0) {
                return ok(null);
            }
            // Drizzle's JSON blob should automatically parse 'models' to LLMModelPrimitiveProps[]
            return ok(this.toEntity(results[0]));
        } catch (e) {
            console.error(`Error loading LLM provider ${id.getValue()}:`, e);
            return error(new DomainError("Failed to load LLM provider.", e instanceof Error ? e : undefined));
        }
    }

    async findById(id: LLMProviderId): Promise<Result<LLMProvider | null>> {
        return this.load(id);
    }

    async create(props: Omit<LLMProviderConstructor, "id">): Promise<Result<LLMProvider>> {
        try {
            const id = LLMProviderId.create(); // Generate new ID
            // Ensure props.models is LLMModel[] for fullProps
            // If props.models is an array of primitives, it should be converted first by the caller or here.
            // Assuming props.models is already LLMModel[] as per LLMProviderConstructor type.
            const fullProps: LLMProviderConstructor = {
                id,
                name: props.name, // VO
                slug: props.slug, // VO
                models: Array.isArray(props.models) ? props.models : [] // Ensure models is an array
            };
            const provider = LLMProvider.create(fullProps);
            return this.save(provider);
        } catch (e) {
             console.error("Error creating LLM provider via repository:", e);
             return error(new DomainError("Failed to create LLM provider via repository.", e instanceof Error ? e : undefined));
        }
    }

    async update(provider: LLMProvider): Promise<Result<LLMProvider>> {
        return this.save(provider);
    }

    async list(): Promise<Result<LLMProvider[]>> {
        try {
            const results = await this.db.select().from(llmProvidersTable).all();
            const providers = results.map(row => this.toEntity(row));
            return ok(providers);
        } catch (e) {
            console.error("Error listing LLM providers:", e);
            return error(new DomainError("Failed to list LLM providers.", e instanceof Error ? e : undefined));
        }
    }

    async delete(id: LLMProviderId): Promise<Result<void>> {
        try {
            const result = await this.db.delete(llmProvidersTable)
                .where(eq(llmProvidersTable.id, id.getValue()))
                .returning({ id: llmProvidersTable.id });

            if (result.length === 0) {
                 return error(new DomainError(`LLMProvider with id ${id.getValue()} not found for deletion.`));
            }
            return ok(undefined);
        } catch (e) {
            console.error(`Error deleting LLM provider ${id.getValue()}:`, e);
            return error(new DomainError("Failed to delete LLM provider.", e instanceof Error ? e : undefined));
        }
    }
}
