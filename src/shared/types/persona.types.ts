export interface CreatePersonaDto {
  nome: string;
  papel: string;
  goal: string;
  backstory: string;
  llmProviderId?: string;
  isActive?: boolean;
}

export interface UpdatePersonaDto extends Partial<CreatePersonaDto> {
  id: string;
}

export interface PersonaDto {
  id: string;
  nome: string;
  papel: string;
  goal: string;
  backstory: string;
  llmProviderId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonaFilterDto {
  nome?: string;
  papel?: string;
  isActive?: boolean;
  llmProviderId?: string;
  projectId?: string;
}

// Project-Persona relationship types
export interface ProjectPersonaDto {
  projectId: string;
  personaId: string;
  addedAt: Date;
  addedBy: string;
}

export interface AddPersonaToProjectDto {
  projectId: string;
  personaId: string;
  addedBy: string;
}

export interface RemovePersonaFromProjectDto {
  projectId: string;
  personaId: string;
}

export interface ProjectPersonaFilterDto {
  projectId?: string;
  personaId?: string;
}