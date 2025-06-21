// src/infrastructure/repositories/source-code-drizzle.repository.ts
import { Result, ok, error } from '@/shared/result';
import { ISourceCodeRepository } from '@/core/ports/repositories/source-code.interface';
import { SourceCode, SourceCodeConstructor } from '@/core/domain/entities/source-code';
import {
    RepositoryId,
    RepositoryPath,
    RepositoryDocsPath
} from '@/core/domain/entities/source-code/value-objects';
import { ProjectId } from '@/core/domain/entities/project/value-objects';
import {
    sourceCodesTable,
    SourceCodeDbInsert,
    SourceCodeDbSelect
} from '../services/drizzle/schemas/source-codes';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DomainError } from '@/core/common/errors';

// Define a type for the schema that the db instance will expect
type DBSchema = {
    sourceCodesTable: typeof sourceCodesTable;
    // projectsTable might be needed if complex joins are done, but not for direct ops on sourceCodesTable
};

export class SourceCodeDrizzleRepository implements ISourceCodeRepository {
    constructor(private readonly db: BetterSQLite3Database<DBSchema>) {}

    private toEntity(row: SourceCodeDbSelect): SourceCode {
        const props: SourceCodeConstructor = {
            id: RepositoryId.create(row.id),
            path: RepositoryPath.create(row.path),
            docsPath: RepositoryDocsPath.create(row.docsPath),
            projectId: ProjectId.create(row.projectId),
            // TODO: Add createdAt/updatedAt if they become part of SourceCode entity and schema
        };
        return SourceCode.create(props); // Use the static create method of the SourceCode entity
    }

    private toPersistence(sourceCode: SourceCode): SourceCodeDbInsert {
        const props = sourceCode.getProps();
        return {
            id: sourceCode.id().getValue(),
            path: props.path.getValue(),
            docsPath: props.docsPath.getValue(),
            projectId: props.projectId.getValue(),
            // TODO: Add createdAt/updatedAt if they become part of SourceCode entity and schema
        };
    }

    async save(sourceCode: SourceCode): Promise<Result<SourceCode>> {
        try {
            const data = this.toPersistence(sourceCode);
            await this.db.insert(sourceCodesTable).values(data)
                .onConflictDoUpdate({ target: sourceCodesTable.id, set: data });
            return ok(sourceCode);
        } catch (e) {
            console.error("Error saving source code record:", e);
            return error(new DomainError("Failed to save source code record.", e instanceof Error ? e : undefined));
        }
    }

    async load(id: RepositoryId): Promise<Result<SourceCode | null>> {
        try {
            const results = await this.db.select().from(sourceCodesTable)
                .where(eq(sourceCodesTable.id, id.getValue()))
                .limit(1);
            if (results.length === 0) {
                return ok(null);
            }
            return ok(this.toEntity(results[0]));
        } catch (e) {
            console.error(`Error loading source code record ${id.getValue()}:`, e);
            return error(new DomainError("Failed to load source code record.", e instanceof Error ? e : undefined));
        }
    }

    async findById(id: RepositoryId): Promise<Result<SourceCode | null>> {
        return this.load(id);
    }

    async create(props: Omit<SourceCodeConstructor, "id">): Promise<Result<SourceCode>> {
        try {
            const id = RepositoryId.create(); // Generate new ID
            const fullProps: SourceCodeConstructor = {
                id,
                path: props.path, // Assume props.path is RepositoryPath VO
                docsPath: props.docsPath, // Assume props.docsPath is RepositoryDocsPath VO
                projectId: props.projectId // Assume props.projectId is ProjectId VO
            };
            const sourceCode = SourceCode.create(fullProps);
            return this.save(sourceCode);
        } catch (e) {
             console.error("Error creating source code record via repository:", e);
             return error(new DomainError("Failed to create source code record via repository.", e instanceof Error ? e : undefined));
        }
    }

    async update(sourceCode: SourceCode): Promise<Result<SourceCode>> {
        return this.save(sourceCode);
    }

    async list(): Promise<Result<SourceCode[]>> {
        try {
            const results = await this.db.select().from(sourceCodesTable).all();
            const sourceCodes = results.map(row => this.toEntity(row));
            return ok(sourceCodes);
        } catch (e) {
            console.error("Error listing source code records:", e);
            return error(new DomainError("Failed to list source code records.", e instanceof Error ? e : undefined));
        }
    }

    async delete(id: RepositoryId): Promise<Result<void>> {
        try {
            const result = await this.db.delete(sourceCodesTable)
                .where(eq(sourceCodesTable.id, id.getValue()))
                .returning({ id: sourceCodesTable.id });

            if (result.length === 0) {
                 return error(new DomainError(`SourceCode record with id ${id.getValue()} not found for deletion.`));
            }
            return ok(undefined);
        } catch (e) {
            console.error(`Error deleting source code record ${id.getValue()}:`, e);
            return error(new DomainError("Failed to delete source code record.", e instanceof Error ? e : undefined));
        }
    }

    async findByProjectId(projectId: ProjectId): Promise<Result<SourceCode[]>> {
        try {
            const results = await this.db.select().from(sourceCodesTable)
                .where(eq(sourceCodesTable.projectId, projectId.getValue()));
            const sourceCodes = results.map(row => this.toEntity(row));
            return ok(sourceCodes);
        } catch (e) {
            console.error(`Error finding source code records for project ${projectId.getValue()}:`, e);
            return error(new DomainError(`Failed to find source code records for project ${projectId.getValue()}.`, e instanceof Error ? e : undefined));
        }
    }
}
