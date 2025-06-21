import { WorkerId, WorkerStatus } from './value-objects';
import { AgentId } from '../agent/value-objects'; // Assuming Worker is tied to an Agent type/config

export interface WorkerProps {
  id: WorkerId;
  // agentType: string; // Or perhaps AgentConfigId VO - specifies what kind of agent this worker can run
  // For now, let's assume a worker might be pre-configured for a specific agent instance or type
  // This is a simplification; a real system might have a more dynamic assignment.
  // For this iteration, let's say a worker is associated with an AgentId it can process jobs for.
  // This might change when WorkerPool and Agent assignment logic is detailed.
  associatedAgentId?: AgentId; // The Agent persona this worker is configured to embody or serve
  status: WorkerStatus;
  lastHeartbeatAt?: Date;
}

export class Worker {
  private readonly props: Readonly<WorkerProps>;

  private constructor(props: WorkerProps) {
    this.props = Object.freeze(props);
  }

  public static create(props: {
    id?: WorkerId;
    associatedAgentId?: AgentId;
    status?: WorkerStatus;
  }): Worker {
    return new Worker({
      id: props.id || WorkerId.create(),
      associatedAgentId: props.associatedAgentId,
      status: props.status || WorkerStatus.idle(),
      lastHeartbeatAt: new Date()
    });
  }

  public get id(): WorkerId { return this.props.id; }
  public get associatedAgentId(): AgentId | undefined { return this.props.associatedAgentId; }
  public get status(): WorkerStatus { return this.props.status; }
  public get lastHeartbeatAt(): Date | undefined { return this.props.lastHeartbeatAt; }

  public updateStatus(newStatus: WorkerStatus): Worker {
    return new Worker({ ...this.props, status: newStatus, lastHeartbeatAt: new Date() });
  }

  public setBusy(agentIdBeingProcessed?: AgentId): Worker {
     // If a worker can dynamically pick up different agents, store it.
     // For now, associatedAgentId is more like its configured persona.
    return this.updateStatus(WorkerStatus.busy());
  }

  public setIdle(): Worker {
    return this.updateStatus(WorkerStatus.idle());
  }
}
