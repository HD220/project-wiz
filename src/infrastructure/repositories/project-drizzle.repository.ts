// src/infrastructure/repositories/project-drizzle.repository.ts
import { Result, ok, error } from '@/shared/result';
import { IProjectRepository } from '@/core/ports/repositories/project.interface';
import { Project, ProjectConstructor } from '@/core/domain/entities/project';
import {
    ProjectId,
    ProjectName,
    ProjectDescription
} from '@/core/domain/entities/project/value-objects';
import { projectsTable, ProjectDbInsert, ProjectDbSelect } from '../services/drizzle/schemas/projects';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DomainError } from '@/core/common/errors';

// Define a type for the schema that the db instance will expect
type DBSchema = { projectsTable: typeof projectsTable; /* ... other tables ... */ };

export class ProjectDrizzleRepository implements IProjectRepository {
    constructor(private readonly db: BetterSQLite3Database<DBSchema>) {}

    private toEntity(row: ProjectDbSelect): Project {
        const props: ProjectConstructor = {
            id: ProjectId.create(row.id),
            name: ProjectName.create(row.name),
            description: ProjectDescription.create(row.description),
            // TODO: Add createdAt/updatedAt if they become part of Project entity and schema
        };
        return Project.create(props); // Use the static create method of the Project entity
    }

    private toPersistence(project: Project): ProjectDbInsert {
        const props = project.getProps();
        return {
            id: project.id().getValue(),
            name: props.name.getValue(),
            description: props.description.getValue(),
            // TODO: Add createdAt/updatedAt if they become part of Project entity and schema
        };
    }

    async save(project: Project): Promise<Result<Project>> {
        try {
            const data = this.toPersistence(project);
            await this.db.insert(projectsTable).values(data)
                .onConflictDoUpdate({ target: projectsTable.id, set: data });
            return ok(project);
        } catch (e) {
            console.error("Error saving project:", e);
            return error(new DomainError("Failed to save project.", e instanceof Error ? e : undefined));
        }
    }

    async load(id: ProjectId): Promise<Result<Project | null>> {
        try {
            const results = await this.db.select().from(projectsTable)
                .where(eq(projectsTable.id, id.getValue()))
                .limit(1);
            if (results.length === 0) {
                return ok(null);
            }
            return ok(this.toEntity(results[0]));
        } catch (e) {
            console.error(`Error loading project ${id.getValue()}:`, e);
            return error(new DomainError("Failed to load project.", e instanceof Error ? e : undefined));
        }
    }

    async findById(id: ProjectId): Promise<Result<Project | null>> {
        return this.load(id);
    }

    async create(props: Omit<ProjectConstructor, "id">): Promise<Result<Project>> {
        try {
            const id = ProjectId.create(); // Generate new ID
            const fullProps: ProjectConstructor = {
                id,
                name: props.name,
                description: props.description
                // TODO: Handle createdAt/updatedAt if they are part of ProjectConstructor directly
                // Or rely on Project.create to set defaults if applicable
            };
            const project = Project.create(fullProps);
            return this.save(project);
        } catch (e) {
             console.error("Error creating project via repository:", e);
             return error(new DomainError("Failed to create project via repository.", e instanceof Error ? e : undefined));
        }
    }

    async update(project: Project): Promise<Result<Project>> {
        return this.save(project);
    }

    async list(): Promise<Result<Project[]>> {
        try {
            const results = await this.db.select().from(projectsTable).all();
            const projects = results.map(row => this.toEntity(row));
            return ok(projects);
        } catch (e) {
            console.error("Error listing projects:", e);
            return error(new DomainError("Failed to list projects.", e instanceof Error ? e : undefined));
        }
    }

    async delete(id: ProjectId): Promise<Result<void>> {
        try {
            const result = await this.db.delete(projectsTable)
                .where(eq(projectsTable.id, id.getValue()))
                .returning({ id: projectsTable.id }); // Check if any row was affected

            if (result.length === 0) {
                 return error(new DomainError(`Project with id ${id.getValue()} not found for deletion.`));
            }
            return ok(undefined);
        } catch (e) {
            console.error(`Error deleting project ${id.getValue()}:`, e);
            return error(new DomainError("Failed to delete project.", e instanceof Error ? e : undefined));
        }
    }
}
