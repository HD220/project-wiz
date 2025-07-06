export interface PersonaTemplate {
  id: string;
  name: string;
  role: string;
  goal: string;
  description?: string;
  systemPrompt?: string;
  visionEnabled?: boolean;
  exampleConversations?: Array<{ user: string; agent: string }>;
  backstory?: string;
  toolNames?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonaTemplateFormData {
  id?: string;
  name: string;
  role: string;
  goal: string;
  description?: string;
  systemPrompt?: string;
  visionEnabled?: boolean;
  exampleConversations?: Array<{ user: string; agent: string }>;
  backstory?: string;
  toolNames?: string[];
}

// Persona Templates
export type GetPersonaTemplatesListRequest = void;
export type GetPersonaTemplatesListResponse = PersonaTemplate[];

export type GetPersonaTemplateDetailsRequest = { templateId: string };
export type GetPersonaTemplateDetailsResponse = PersonaTemplate | null;

export type CreatePersonaTemplateRequest = PersonaTemplateFormData;
export type CreatePersonaTemplateResponse = PersonaTemplate;

export type UpdatePersonaTemplateRequest = {
  templateId: string;
  data: Partial<PersonaTemplateFormData>;
};
export type UpdatePersonaTemplateResponse = PersonaTemplate;

export type DeletePersonaTemplateRequest = { templateId: string };
export type DeletePersonaTemplateResponse = { success: boolean };

export type PersonaTemplatesUpdatedEventPayload = PersonaTemplate[];
