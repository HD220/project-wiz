// DTOs para comunicação IPC entre Main e Renderer

// DTO para criar um novo canal
export interface CreateChannelDto {
  name: string;
  description?: string;
  type: 'general' | 'task' | 'agent' | 'custom';
  projectId: string;
  isPrivate?: boolean;
  createdBy: string;
}

// DTO para atualizar canal existente
export interface UpdateChannelDto {
  id: string;
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

// DTO para resposta (output)
export interface ChannelDto {
  id: string;
  name: string;
  description?: string;
  type: string;
  projectId: string;
  isPrivate: boolean;
  isArchived: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para filtros de busca
export interface ChannelFilterDto {
  projectId?: string;
  type?: string;
  isArchived?: boolean;
  isPrivate?: boolean;
}

// Enum para tipos de canal
export const ChannelType = {
  GENERAL: 'general',
  TASK: 'task', 
  AGENT: 'agent',
  CUSTOM: 'custom',
} as const;

export type ChannelTypeEnum = typeof ChannelType[keyof typeof ChannelType];