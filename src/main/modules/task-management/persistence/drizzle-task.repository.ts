import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import { Task } from '../domain/entities/task.entity';
import { TaskRepository } from '../domain/repositories/task.repository';
import { tasks, taskDependencies } from './schema';

export class DrizzleTaskRepository implements TaskRepository {
  constructor(private readonly db: BetterSQLite3Database<any>) {}

  async save(task: Task): Promise<void> {
    const taskData = {
      id: task.id,
      projectId: task.props.projectId,
      assignedAgentId: task.props.assignedAgentId || null,
      title: task.props.title,
      description: task.props.description || null,
      status: task.props.status,
      priority: task.props.priority,
      type: task.props.type,
      parentTaskId: task.props.parentTaskId || null,
      estimatedHours: task.props.estimatedHours || null,
      actualHours: task.props.actualHours || null,
      progressPercentage: task.props.progressPercentage,
      dueDate: task.props.dueDate ? task.props.dueDate.getTime() : null,
      startedAt: task.props.startedAt ? task.props.startedAt.getTime() : null,
      completedAt: task.props.completedAt ? task.props.completedAt.getTime() : null,
      createdAt: task.props.createdAt.getTime(),
      updatedAt: task.props.updatedAt.getTime(),
    };

    await this.db.insert(tasks).values(taskData)
      .onConflictDoUpdate({
        target: tasks.id,
        set: taskData
      });
  }

  async findById(id: string): Promise<Task | null> {
    const [result] = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    return result ? this.mapToDomainEntity(result) : null;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const results = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(desc(tasks.createdAt));

    return results.map(this.mapToDomainEntity);
  }

  async findByAgentId(agentId: string): Promise<Task[]> {
    const results = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedAgentId, agentId))
      .orderBy(desc(tasks.createdAt));

    return results.map(this.mapToDomainEntity);
  }

  async getNextTaskInQueue(agentId?: string): Promise<Task | null> {
    let query = this.db
      .select()
      .from(tasks)
      .where(eq(tasks.status, 'pending'));

    if (agentId) {
      query = query.where(and(
        eq(tasks.status, 'pending'),
        eq(tasks.assignedAgentId, agentId)
      ));
    }

    const [result] = await query
      .orderBy(
        // Prioridade: critical > high > medium > low
        asc(tasks.priority === 'critical' ? 0 : tasks.priority === 'high' ? 1 : tasks.priority === 'medium' ? 2 : 3),
        asc(tasks.createdAt)
      )
      .limit(1);

    return result ? this.mapToDomainEntity(result) : null;
  }

  async findByStatus(status: Task['props']['status']): Promise<Task[]> {
    const results = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.status, status))
      .orderBy(desc(tasks.createdAt));

    return results.map(this.mapToDomainEntity);
  }

  async findByPriority(priority: Task['props']['priority']): Promise<Task[]> {
    const results = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.priority, priority))
      .orderBy(desc(tasks.createdAt));

    return results.map(this.mapToDomainEntity);
  }

  async findAll(page: number = 1, limit: number = 50): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
  }> {
    const offset = (page - 1) * limit;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(tasks);

    const results = await this.db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      tasks: results.map(this.mapToDomainEntity),
      total: totalResult.count,
      page,
      limit,
    };
  }

  async update(task: Task): Promise<void> {
    await this.save(task); // Reutiliza o método save que já faz upsert
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(tasks).where(eq(tasks.id, id));
  }

  async findSubtasks(parentTaskId: string): Promise<Task[]> {
    const results = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.parentTaskId, parentTaskId))
      .orderBy(desc(tasks.createdAt));

    return results.map(this.mapToDomainEntity);
  }

  async findTaskDependencies(taskId: string): Promise<Task[]> {
    const dependencyResults = await this.db
      .select({
        task: tasks
      })
      .from(taskDependencies)
      .innerJoin(tasks, eq(taskDependencies.dependsOnTaskId, tasks.id))
      .where(eq(taskDependencies.taskId, taskId));

    return dependencyResults.map(result => this.mapToDomainEntity(result.task));
  }

  async canTaskBeStarted(taskId: string): Promise<boolean> {
    const [dependencyCount] = await this.db
      .select({ count: count() })
      .from(taskDependencies)
      .innerJoin(tasks, eq(taskDependencies.dependsOnTaskId, tasks.id))
      .where(and(
        eq(taskDependencies.taskId, taskId),
        eq(tasks.status, 'completed')
      ));

    const [totalDependencies] = await this.db
      .select({ count: count() })
      .from(taskDependencies)
      .where(eq(taskDependencies.taskId, taskId));

    // Pode ser iniciada se todas as dependências estão completas
    return dependencyCount.count === totalDependencies.count;
  }

  async countTasksByStatus(projectId: string): Promise<Record<string, number>> {
    const results = await this.db
      .select({
        status: tasks.status,
        count: count()
      })
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .groupBy(tasks.status);

    const statusCounts: Record<string, number> = {};
    results.forEach(result => {
      statusCounts[result.status] = result.count;
    });

    return statusCounts;
  }

  private mapToDomainEntity(row: any): Task {
    return new Task({
      projectId: row.projectId,
      assignedAgentId: row.assignedAgentId || undefined,
      title: row.title,
      description: row.description || undefined,
      status: row.status,
      priority: row.priority,
      type: row.type,
      parentTaskId: row.parentTaskId || undefined,
      estimatedHours: row.estimatedHours || undefined,
      actualHours: row.actualHours || undefined,
      progressPercentage: row.progressPercentage,
      dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
      startedAt: row.startedAt ? new Date(row.startedAt) : undefined,
      completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }, row.id);
  }
}