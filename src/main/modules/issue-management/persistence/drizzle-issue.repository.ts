import { Issue } from "../domain/entities/issue.entity";
import { IssueRepository } from "../domain/repositories/issue.repository";
import { db } from "@/main/persistence/db";
import { issues } from "../persistence/schema";
import { eq } from "drizzle-orm";

export class DrizzleIssueRepository implements IssueRepository {
  async save(issue: Issue): Promise<void> {
    const data = {
      id: issue.id,
      projectId: issue.props.projectId,
      title: issue.props.title,
      description: issue.props.description,
      status: issue.props.status,
      priority: issue.props.priority,
      assignedToAgentId: issue.props.assignedToAgentId,
      createdByUserId: issue.props.createdByUserId,
      createdAt: issue.props.createdAt.getTime(),
      updatedAt: issue.props.updatedAt.getTime(),
    };

    await db.insert(issues).values(data).onConflictDoUpdate({
      target: issues.id,
      set: data,
    });
  }

  async findById(id: string): Promise<Issue | null> {
    const result = await db.select().from(issues).where(eq(issues.id, id)).execute();
    if (result.length === 0) {
      return null;
    }
    const data = result[0];
    return new Issue(
      {
        projectId: data.projectId,
        title: data.title,
        description: data.description || undefined,
        status: data.status as any,
        priority: data.priority as any,
        assignedToAgentId: data.assignedToAgentId || undefined,
        createdByUserId: data.createdByUserId || undefined,
      },
      data.id,
    );
  }

  async findByProjectId(projectId: string): Promise<Issue[]> {
    const result = await db.select().from(issues).where(eq(issues.projectId, projectId)).execute();
    return result.map(
      (data) =>
        new Issue(
          {
            projectId: data.projectId,
            title: data.title,
            description: data.description || undefined,
            status: data.status as any,
            priority: data.priority as any,
            assignedToAgentId: data.assignedToAgentId || undefined,
            createdByUserId: data.createdByUserId || undefined,
          },
          data.id,
        ),
    );
  }

  async delete(id: string): Promise<void> {
    await db.delete(issues).where(eq(issues.id, id)).execute();
  }
}