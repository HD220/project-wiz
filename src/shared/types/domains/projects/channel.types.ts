// DTOs para comunicação IPC entre Main e Renderer

// DTO para criar um novo canal
export interface CreateChannelDto {
  name: string;
  description?: string;
  projectId: string;
}

// DTO para atualizar canal existente
export interface UpdateChannelDto {
  id: string;
  name?: string;
  description?: string;
}

// DTO para resposta (output)
export interface ChannelDto {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para filtros de busca
export interface ChannelFilterDto {
  projectId?: string;
}
