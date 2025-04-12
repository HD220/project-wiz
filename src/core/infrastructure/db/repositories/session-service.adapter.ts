import { eq, and } from "drizzle-orm";
import { db } from "../client";
import { conversations } from "../schema";
import { SessionServicePort, Session, SessionMetadata, SessionFilter, SessionStatus } from "../../../domain/ports/session-service.port";

export class SessionServiceAdapter implements SessionServicePort {
  async createSession(metadata: SessionMetadata, title?: string): Promise<Session> {
    const now = new Date();
    const id = crypto.randomUUID();
    await db.insert(conversations).values({
      id,
      createdAt: now,
      updatedAt: now,
      title,
      status: "active",
      metadata,
    });
    return {
      id,
      createdAt: now,
      updatedAt: now,
      title,
      status: "active",
      metadata,
    };
  }

  async pauseSession(sessionId: string): Promise<void> {
    await db.update(conversations)
      .set({ status: "paused", updatedAt: new Date() })
      .where(eq(conversations.id, sessionId));
  }

  async resumeSession(sessionId: string): Promise<void> {
    await db.update(conversations)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(conversations.id, sessionId));
  }

  async endSession(sessionId: string): Promise<void> {
    await db.update(conversations)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(conversations.id, sessionId));
  }

  async listSessions(filter?: SessionFilter): Promise<Session[]> {
    const whereClauses = [];
    if (filter?.status) {
      whereClauses.push(eq(conversations.status, filter.status));
    }

    const results = await db.select().from(conversations).where(
      whereClauses.length > 0 ? and(...whereClauses) : undefined
    );

    // In-memory filter by metadata
    const filtered = results.filter((row) => {
      const metadata = row.metadata as SessionMetadata | undefined;
      if (!filter) return true;
      if (filter.repositoryId && metadata?.repositoryId !== filter.repositoryId) return false;
      if (filter.taskId && metadata?.taskId !== filter.taskId) return false;
      if (filter.workflow && metadata?.workflow !== filter.workflow) return false;
      return true;
    });

    return filtered.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      title: row.title ?? undefined,
      status: row.status as SessionStatus,
      metadata: row.metadata as SessionMetadata,
    }));
  }
}