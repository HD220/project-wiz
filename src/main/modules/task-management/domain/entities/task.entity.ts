import { BaseEntity } from '@/main/kernel/domain/base.entity';
import { z } from 'zod';

// Schema de validação Zod
export const TaskPropsSchema = z.object({
  projectId: z.string().uuid(),
  assignedAgentId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.enum(['feature', 'bug', 'refactor', 'documentation', 'test']),
  parentTaskId: z.string().uuid().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
  progressPercentage: z.number().min(0).max(100).default(0),
  dueDate: z.date().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TaskProps = z.infer<typeof TaskPropsSchema>;

export class Task extends BaseEntity<TaskProps> {
  constructor(props: TaskProps, id?: string) {
    // Validar props com Zod antes de criar
    const validatedProps = TaskPropsSchema.parse(props);
    super(validatedProps, id);
  }

  // Método para atribuir agente à tarefa
  assignToAgent(agentId: string): void {
    z.string().uuid().parse(agentId); // Validar agentId
    (this.props as any).assignedAgentId = agentId;
    (this.props as any).updatedAt = new Date();
  }

  // Método para marcar como em progresso
  markAsInProgress(): void {
    if (this.props.status === 'pending') {
      (this.props as any).status = 'in_progress';
      (this.props as any).startedAt = new Date();
      (this.props as any).updatedAt = new Date();
    } else {
      throw new Error(`Cannot start task with status: ${this.props.status}`);
    }
  }

  // Método para atualizar progresso
  updateProgress(percentage: number): void {
    const validatedPercentage = z.number().min(0).max(100).parse(percentage);
    (this.props as any).progressPercentage = validatedPercentage;
    (this.props as any).updatedAt = new Date();
  }

  // Método para marcar como completa
  markAsCompleted(): void {
    if (this.props.status === 'in_progress') {
      (this.props as any).status = 'completed';
      (this.props as any).completedAt = new Date();
      (this.props as any).progressPercentage = 100;
      (this.props as any).updatedAt = new Date();
    } else {
      throw new Error(`Cannot complete task with status: ${this.props.status}`);
    }
  }

  // Método para marcar como falhada
  markAsFailed(): void {
    if (this.props.status === 'in_progress') {
      (this.props as any).status = 'failed';
      (this.props as any).updatedAt = new Date();
    } else {
      throw new Error(`Cannot fail task with status: ${this.props.status}`);
    }
  }

  // Método para cancelar tarefa
  cancel(): void {
    if (this.props.status === 'pending' || this.props.status === 'in_progress') {
      (this.props as any).status = 'cancelled';
      (this.props as any).updatedAt = new Date();
    } else {
      throw new Error(`Cannot cancel task with status: ${this.props.status}`);
    }
  }

  // Método para verificar se pode ser iniciada
  canBeStarted(): boolean {
    return this.props.status === 'pending';
  }

  // Método para verificar se está ativa
  isActive(): boolean {
    return this.props.status === 'in_progress';
  }

  // Método para verificar se está finalizada
  isFinished(): boolean {
    return ['completed', 'failed', 'cancelled'].includes(this.props.status);
  }


  // Getters para propriedades principais
  get projectId(): string {
    return this.props.projectId;
  }

  get assignedAgentId(): string | undefined {
    return this.props.assignedAgentId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get status(): TaskProps['status'] {
    return this.props.status;
  }

  get priority(): TaskProps['priority'] {
    return this.props.priority;
  }

  get type(): TaskProps['type'] {
    return this.props.type;
  }

  get progressPercentage(): number {
    return this.props.progressPercentage;
  }
}