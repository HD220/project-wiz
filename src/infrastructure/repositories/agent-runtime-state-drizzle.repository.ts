import { Result, ok, error } from '@/shared/result';
import { IAgentRuntimeStateRepository } from '@/core/ports/repositories/agent-runtime-state.repository.interface';
import {
    AgentRuntimeState,
    AgentRuntimeStateCreateProps,
    // AgentRuntimeStateProps // Not directly used if create props are sufficient for reconstruction
} from '@/core/domain/entities/agent/agent-runtime-state.entity';
import { AgentId } from '@/core/domain/entities/agent/value-objects/runtime-state/agent-id.vo';
import { ProjectId } from '@/core/domain/entities/agent/value-objects/runtime-state/project-id.vo';
import { IssueId } from '@/core/domain/entities/agent/value-objects/runtime-state/issue-id.vo';
import { GeneralNotesCollection } from '@/core/domain/entities/agent/value-objects/runtime-state/general-notes.collection';
import { PromisesMadeCollection } from '@/core/domain/entities/agent/value-objects/runtime-state/promises-made.collection';
import { NoteText } from '@/core/domain/entities/agent/value-objects/runtime-state/note-text.vo';
import { PromiseText } from '@/core/domain/entities/agent/value-objects/runtime-state/promise-text.vo';
import { GoalToPlan } from '@/core/domain/entities/job/value-objects/context-parts/goal-to-plan.vo';
// Import JobTimestamp if AgentRuntimeState uses it for createdAt/updatedAt
// import { JobTimestamp } from '@/core/domain/entities/job/value-objects/job-timestamp.vo';

import { agentRuntimeStatesTable, AgentRuntimeStateDbInsert, AgentRuntimeStateDbSelect } from '../services/drizzle/schemas/agent-runtime-states';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DomainError } from '@/core/common/errors';

type DBSchema = { agentRuntimeStatesTable: typeof agentRuntimeStatesTable; /* other tables */ };

// Types for serialized collections (arrays of primitives for DB storage)
type NoteTextPrimitiveInput = { text: string };
type PromiseTextPrimitiveInput = { text: string };


export class AgentRuntimeStateDrizzleRepository implements IAgentRuntimeStateRepository {
    constructor(private readonly db: BetterSQLite3Database<DBSchema>) {}

    private toEntity(row: AgentRuntimeStateDbSelect): AgentRuntimeState {
        // AgentRuntimeState.create expects AgentRuntimeStateCreateProps.
        // This means for collections, it can take NoteText[] or PromiseText[]
        // which are then converted to GeneralNotesCollection/PromisesMadeCollection internally.
        const createProps: AgentRuntimeStateCreateProps = {
            agentId: AgentId.create(row.agentId),
            currentProjectId: row.currentProjectId ? ProjectId.create(row.currentProjectId) : undefined,
            currentIssueId: row.currentIssueId ? IssueId.create(row.currentIssueId) : undefined,
            currentGoal: row.currentGoal ? GoalToPlan.create(row.currentGoal) : undefined,

            generalNotes: row.generalNotes ?
                          (row.generalNotes as NoteTextPrimitiveInput[]).map(n => NoteText.create(n.text)) :
                          [], // Pass NoteText[]
            promisesMade: row.promisesMade ?
                          (row.promisesMade as PromiseTextPrimitiveInput[]).map(p => PromiseText.create(p.text)) :
                          [], // Pass PromiseText[]
            // TODO: Add createdAt/updatedAt if they become part of AgentRuntimeState
            // createdAt: row.createdAt ? JobTimestamp.create(new Date(row.createdAt)) : undefined,
            // updatedAt: row.updatedAt ? JobTimestamp.create(new Date(row.updatedAt)) : undefined,
        };
        return AgentRuntimeState.create(createProps);
    }

    private toPersistence(state: AgentRuntimeState): AgentRuntimeStateDbInsert {
        const props = state.getProps(); // This gets AgentRuntimeStateProps, which has VOs
        return {
            agentId: state.id().getValue(),
            currentProjectId: props.currentProjectId?.getValue(),
            currentIssueId: props.currentIssueId?.getValue(), // getValue() handles string | number
            currentGoal: props.currentGoal?.getValue(),
            generalNotes: props.generalNotes.getValues().map(n => ({ text: n.getValue() })), // getValues returns NoteText[]
            promisesMade: props.promisesMade.getValues().map(p => ({ text: p.getValue() })), // getValues returns PromiseText[]
            // TODO: Add createdAt/updatedAt if they become part of AgentRuntimeState
            // createdAt: props.createdAt?.getValue().getTime(),
            // updatedAt: props.updatedAt?.getValue().getTime(),
        };
    }

    async save(state: AgentRuntimeState): Promise<Result<AgentRuntimeState>> {
        try {
            const data = this.toPersistence(state);
            await this.db.insert(agentRuntimeStatesTable).values(data)
                .onConflictDoUpdate({ target: agentRuntimeStatesTable.agentId, set: data });
            return ok(state);
        } catch (e) {
            console.error("Error saving agent runtime state:", e);
            return error(new DomainError("Failed to save agent runtime state.", e instanceof Error ? e : undefined));
        }
    }

    async load(id: AgentId): Promise<Result<AgentRuntimeState | null>> {
        try {
            const results = await this.db.select().from(agentRuntimeStatesTable)
                .where(eq(agentRuntimeStatesTable.agentId, id.getValue()))
                .limit(1);
            if (results.length === 0) {
                return ok(null);
            }
            return ok(this.toEntity(results[0]));
        } catch (e) {
            console.error(`Error loading agent runtime state for agent ${id.getValue()}:`, e);
            return error(new DomainError("Failed to load agent runtime state.", e instanceof Error ? e : undefined));
        }
    }

    // IRepository stubs / simple implementations
    async findById(id: AgentId): Promise<Result<AgentRuntimeState | null>> {
        return this.load(id);
    }

    async create(state: AgentRuntimeState): Promise<Result<AgentRuntimeState>> {
        // 'save' handles creation due to upsert logic
        return this.save(state);
    }

    async update(state: AgentRuntimeState): Promise<Result<AgentRuntimeState>> {
        // 'save' handles update due to upsert logic
        return this.save(state);
    }

    async list(): Promise<Result<AgentRuntimeState[]>> {
        try {
            const results = await this.db.select().from(agentRuntimeStatesTable).all();
            const states = results.map(row => this.toEntity(row));
            return ok(states);
        } catch (e) {
            console.error("Error listing agent runtime states:", e);
            return error(new DomainError("Failed to list agent runtime states.", e instanceof Error ? e : undefined));
        }
    }

    async delete(id: AgentId): Promise<Result<void>> {
        try {
            const result = await this.db.delete(agentRuntimeStatesTable)
                .where(eq(agentRuntimeStatesTable.agentId, id.getValue()))
                .returning(); // Check if any row was affected
            if (result.length === 0) {
                 return error(new DomainError(`AgentRuntimeState with agentId ${id.getValue()} not found for deletion.`));
            }
            return ok(undefined);
        } catch (e) {
            console.error(`Error deleting agent runtime state for agent ${id.getValue()}:`, e);
            return error(new DomainError("Failed to delete agent runtime state.", e instanceof Error ? e : undefined));
        }
    }
}
