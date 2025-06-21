import { IRepository } from '@/core/common/repository';
import { AgentRuntimeState } from '@/core/domain/entities/agent/agent-runtime-state.entity';

export type IAgentRuntimeStateRepository = IRepository<typeof AgentRuntimeState>;
