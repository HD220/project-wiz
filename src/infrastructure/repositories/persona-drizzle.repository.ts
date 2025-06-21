import { Result, ok, error } from '@/shared/result';
import { IPersonaRepository } from '@/core/ports/repositories/persona.interface';
import { Persona, PersonaConstructor } from '@/core/domain/entities/agent/value-objects/persona';
import {
    PersonaId,
    PersonaName,
    PersonaRole,
    PersonaGoal,
    PersonaBackstory
} from '@/core/domain/entities/agent/value-objects/persona/value-objects';
import { personasTable, PersonaDbInsert, PersonaDbSelect } from '../services/drizzle/schemas/personas';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DomainError } from '@/core/common/errors';

// Define a type for the schema that the db instance will expect
type DBSchema = { personasTable: typeof personasTable; /* ... other tables ... */ };

export class PersonaDrizzleRepository implements IPersonaRepository {
    constructor(private readonly db: BetterSQLite3Database<DBSchema>) {}

    private toEntity(row: PersonaDbSelect): Persona {
        const props: PersonaConstructor = {
            id: PersonaId.create(row.id), // Assumes PersonaId.create can handle string
            name: PersonaName.create(row.name),
            role: PersonaRole.create(row.role),
            goal: PersonaGoal.create(row.goal),
            backstory: PersonaBackstory.create(row.backstory),
        };
        return Persona.create(props); // Use the static create method of the Persona entity
    }

    private toPersistence(persona: Persona): PersonaDbInsert {
        const props = persona.getProps();
        return {
            id: persona.id().getValue(),
            name: props.name.getValue(),
            role: props.role.getValue(),
            goal: props.goal.getValue(),
            backstory: props.backstory.getValue(),
        };
    }

    async save(persona: Persona): Promise<Result<Persona>> {
        try {
            const personaData = this.toPersistence(persona);
            await this.db.insert(personasTable).values(personaData)
                .onConflictDoUpdate({ target: personasTable.id, set: personaData });
            return ok(persona);
        } catch (e) {
            console.error("Error saving persona:", e);
            return error(new DomainError("Failed to save persona.", e instanceof Error ? e : undefined));
        }
    }

    async load(id: PersonaId): Promise<Result<Persona | null>> {
        try {
            const results = await this.db.select().from(personasTable).where(eq(personasTable.id, id.getValue())).limit(1);
            if (results.length === 0) {
                return ok(null);
            }
            return ok(this.toEntity(results[0]));
        } catch (e) {
            console.error(`Error loading persona ${id.getValue()}:`, e);
            return error(new DomainError("Failed to load persona.", e instanceof Error ? e : undefined));
        }
    }

    async findById(id: PersonaId): Promise<Result<Persona | null>> { // For IRepository compatibility
        return this.load(id);
    }

    async create(props: Omit<PersonaConstructor, "id">): Promise<Result<Persona>> {
        try {
            const id = PersonaId.create(); // Generate new ID
            const fullProps: PersonaConstructor = { id, ...props };
            const persona = Persona.create(fullProps);
            // Delegate to save, which handles upsert logic (insert or update if ID somehow collides)
            return this.save(persona);
        } catch (e) {
             console.error("Error creating persona via repository create:", e);
             return error(new DomainError("Failed to create persona via repository create.", e instanceof Error ? e : undefined));
        }
    }

    async update(persona: Persona): Promise<Result<Persona>> { // For IRepository compatibility
        // Save handles update (upsert)
        return this.save(persona);
    }

    async list(): Promise<Result<Persona[]>> {
        try {
            const results = await this.db.select().from(personasTable).all();
            const personas = results.map(row => this.toEntity(row));
            return ok(personas);
        } catch (e) {
            console.error("Error listing personas:", e);
            return error(new DomainError("Failed to list personas.", e instanceof Error ? e : undefined));
        }
    }

    async delete(id: PersonaId): Promise<Result<void>> {
        try {
            const result = await this.db.delete(personasTable).where(eq(personasTable.id, id.getValue())).returning();
            if (result.length === 0) { // Check if any row was actually deleted
                 return error(new DomainError(`Persona with id ${id.getValue()} not found for deletion.`));
            }
            return ok(undefined);
        } catch (e) {
            console.error(`Error deleting persona ${id.getValue()}:`, e);
            return error(new DomainError("Failed to delete persona.", e instanceof Error ? e : undefined));
        }
    }
}
