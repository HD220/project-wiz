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