import { Sprint } from "../domain/entities/sprint.entity";
import { SprintRepository } from "../domain/repositories/sprint.repository";
import { db } from "@/main/persistence/db";
import { sprints } from "../persistence/schema";
import { eq } from "drizzle-orm";

export class DrizzleSprintRepository implements SprintRepository {
  async save(sprint: Sprint): Promise<void> {
    const data = {
      id: sprint.id,
      projectId: sprint.props.projectId,
      name: sprint.props.name,
      startDate: sprint.props.startDate,
      endDate: sprint.props.endDate,
      status: sprint.props.status,
      createdAt: sprint.props.createdAt.getTime(),
      updatedAt: sprint.props.updatedAt.getTime(),
    };

    await db.insert(sprints).values(data).onConflictDoUpdate({
      target: sprints.id,
      set: data,
    });
  }

  async findById(id: string): Promise<Sprint | null> {
    const result = await db.select().from(sprints).where(eq(sprints.id, id)).execute();
    if (result.length === 0) {
      return null;
    }
    const data = result[0];
    return new Sprint(
      {
        projectId: data.projectId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status as any,
      },
      data.id,
    );
  }

  async findByProjectId(projectId: string): Promise<Sprint[]> {
    const result = await db.select().from(sprints).where(eq(sprints.projectId, projectId)).execute();
    return result.map(
      (data) =>
        new Sprint(
          {
            projectId: data.projectId,
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            status: data.status as any,
          },
          data.id,
        ),
    );
  }

  async delete(id: string): Promise<void> {
    await db.delete(sprints).where(eq(sprints.id, id)).execute();
  }
}