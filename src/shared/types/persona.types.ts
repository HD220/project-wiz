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
}