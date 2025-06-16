// src/infrastructure/repositories/drizzle/annotation.repository.ts
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, desc, and } from 'drizzle-orm'; // Add other operators as needed
import { annotationsTable, InsertAnnotation, SelectAnnotation } from '../../services/drizzle/schemas/annotations';
import { Annotation, AnnotationProps } from '../../../core/domain/entities/annotation/annotation.entity';
import { IAnnotationRepository } from '../../../core/ports/repositories/annotation.interface';

// Define DrizzleDB type (can be moved to a shared types file later)
type DrizzleDB = BetterSQLite3Database<Record<string, any>>; // Using 'any' for schema record for simplicity here

function dbToDomain(row: SelectAnnotation): Annotation {
  return new Annotation({
    id: row.id,
    text: row.text,
    agentId: row.agentId || undefined,
    jobId: row.jobId || undefined,
    createdAt: row.createdAt, // Drizzle handles Date conversion from timestamp_ms
    updatedAt: row.updatedAt,
  });
}

function domainToDb(annotation: Annotation): InsertAnnotation {
  const props = annotation.props;
  return {
    id: props.id,
    text: props.text,
    agentId: props.agentId,
    jobId: props.jobId,
    createdAt: props.createdAt,
    updatedAt: props.updatedAt,
  };
}

export class DrizzleAnnotationRepository implements IAnnotationRepository {
  private readonly repositoryDB: DrizzleDB;

  constructor(dbInstance: DrizzleDB) {
    this.repositoryDB = dbInstance;
  }

  async findById(id: string): Promise<Annotation | null> {
    const result = await this.repositoryDB
      .select()
      .from(annotationsTable)
      .where(eq(annotationsTable.id, id))
      .limit(1);
    return result.length ? dbToDomain(result[0]) : null;
  }

  async findByAgentId(agentId: string, limit: number = 20, offset: number = 0): Promise<Annotation[]> {
    const results = await this.repositoryDB
      .select()
      .from(annotationsTable)
      .where(eq(annotationsTable.agentId, agentId))
      .orderBy(desc(annotationsTable.createdAt)) // Example ordering
      .limit(limit)
      .offset(offset);
    return results.map(dbToDomain);
  }

  async save(annotation: Annotation): Promise<void> {
    const dbAnnotationData = domainToDb(annotation);
    // Upsert logic
    await this.repositoryDB
      .insert(annotationsTable)
      .values(dbAnnotationData)
      .onConflictDoUpdate({
        target: annotationsTable.id,
        set: {
          text: dbAnnotationData.text,
          agentId: dbAnnotationData.agentId,
          jobId: dbAnnotationData.jobId,
          updatedAt: new Date(), // Ensure updatedAt is always fresh on update
        },
      });
    console.log(`DrizzleAnnotationRepository: Saved annotation ${annotation.id}`);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repositoryDB
      .delete(annotationsTable)
      .where(eq(annotationsTable.id, id))
      .returning(); // Check if rows were affected

    if (result.length === 0) {
      console.warn(`DrizzleAnnotationRepository: Annotation with id ${id} not found for deletion.`);
    } else {
      console.log(`DrizzleAnnotationRepository: Deleted annotation ${id}`);
    }
  }
}
