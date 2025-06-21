import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { agentStates, AgentStatesInsert } from '../services/drizzle/schemas/agent-states'; // Adjusted path
import { IAgentStateRepository } from '@/core/application/ports/agent-state-repository.interface';
import { AgentInternalState, AgentId } from '@/core/domain/entities/agent';

export class AgentStateDrizzleRepository implements IAgentStateRepository {
  constructor(
    private readonly db: BetterSQLite3Database<typeof import('../services/drizzle/schemas')> // More specific DB type
  ) {}

  private mapRowToEntity(row: typeof agentStates.$inferSelect): AgentInternalState {
    // Ensure AgentId is correctly instantiated from the string value
    const agentId = AgentId.fromString(row.agentId);

    return AgentInternalState.create({
      agentId: agentId,
      currentProjectId: row.currentProjectId ?? undefined,
      currentGoal: row.currentGoal ?? undefined,
      generalNotes: row.generalNotes ?? undefined,
      // Ensure any other properties defined in AgentInternalStateProps are mapped here
      // e.g., lastProcessedActivityTimestamp: row.lastProcessedActivityTimestamp ? new Date(row.lastProcessedActivityTimestamp) : undefined,
    });
  }

  private mapEntityToInsertSchema(entity: AgentInternalState): Omit<AgentStatesInsert, 'updatedAt'> {
    // Omit 'updatedAt' because Drizzle's $defaultFn will handle it on insert,
    // and we will explicitly set it on update.
    return {
      agentId: entity.agentId.getValue(),
      currentProjectId: entity.currentProjectId,
      currentGoal: entity.currentGoal,
      generalNotes: entity.generalNotes,
      // lastProcessedActivityTimestamp: entity.props.lastProcessedActivityTimestamp?.getTime(),
    };
  }

  async findByAgentId(agentId: AgentId): Promise<AgentInternalState | null> {
    const result = await this.db
      .select()
      .from(agentStates)
      .where(eq(agentStates.agentId, agentId.getValue()))
      .limit(1);

    if (result.length === 0) {
      return null;
    }
    return this.mapRowToEntity(result[0]);
  }

  async save(agentState: AgentInternalState): Promise<void> {
    const valuesToInsert = this.mapEntityToInsertSchema(agentState);
    // For the 'set' part of onConflictDoUpdate, we don't include the target (PK)
    // and we want to explicitly set updatedAt.
    const valuesToUpdate = {
      currentProjectId: agentState.currentProjectId,
      currentGoal: agentState.currentGoal,
      generalNotes: agentState.generalNotes,
      // lastProcessedActivityTimestamp: agentState.props.lastProcessedActivityTimestamp?.getTime(),
      updatedAt: Date.now(), // Explicitly set updatedAt for updates
    };

    await this.db
      .insert(agentStates)
      .values({
        ...valuesToInsert,
        // updatedAt for insert is handled by $defaultFn in schema
      })
      .onConflictDoUpdate({
        target: agentStates.agentId,
        set: valuesToUpdate,
      });
  }
}
