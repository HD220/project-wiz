import { ipcMain } from 'electron';

import {
  GET_PERSONA_TEMPLATES_CHANNEL,
  GET_PERSONA_TEMPLATE_DETAILS_CHANNEL,
  CREATE_PERSONA_TEMPLATE_CHANNEL,
  UPDATE_PERSONA_TEMPLATE_CHANNEL,
} from '../../../../shared/ipc-channels';
import {
  GetPersonaTemplatesResponse,
  GetPersonaTemplateDetailsRequest,
  GetPersonaTemplateDetailsResponse,
  CreatePersonaTemplateRequest,
  CreatePersonaTemplateResponse,
  UpdatePersonaTemplateRequest,
  UpdatePersonaTemplateResponse,
} from '../../../../shared/ipc-types';
import { PersonaTemplate } from '../../../../shared/types/entities';
import { mockPersonaTemplates } from '../mocks/persona-template.mocks';

export function registerPersonaTemplateHandlers() {
  ipcMain.handle(GET_PERSONA_TEMPLATES_CHANNEL, async (): Promise<GetPersonaTemplatesResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { personaTemplates: mockPersonaTemplates };
  });

  ipcMain.handle(GET_PERSONA_TEMPLATE_DETAILS_CHANNEL, async (_event, req: GetPersonaTemplateDetailsRequest): Promise<GetPersonaTemplateDetailsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const template = mockPersonaTemplates.find(pt => pt.id === req.templateId);
    if (template) {
      return { personaTemplate: template };
    }
      return { personaTemplate: undefined, error: 'Persona Template not found' };

  });

  ipcMain.handle(CREATE_PERSONA_TEMPLATE_CHANNEL, async (_event, req: CreatePersonaTemplateRequest): Promise<CreatePersonaTemplateResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const newTemplate: PersonaTemplate = {
      id: `pt-${Date.now()}`,
      name: req.name,
      description: req.description,
      systemPrompt: req.systemPrompt,
      visionEnabled: req.visionEnabled || false,
      exampleConversations: req.exampleConversations || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // In a real scenario, you'd add this to your persistent or in-memory store
    mockPersonaTemplates.push(newTemplate);
    return { personaTemplate: newTemplate };
  });

  ipcMain.handle(UPDATE_PERSONA_TEMPLATE_CHANNEL, async (_event, req: UpdatePersonaTemplateRequest): Promise<UpdatePersonaTemplateResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const templateIndex = mockPersonaTemplates.findIndex(pt => pt.id === req.templateId);
    if (templateIndex !== -1) {
      const updatedTemplate = { ...mockPersonaTemplates[templateIndex], ...req.updates, updatedAt: new Date().toISOString() };
      mockPersonaTemplates[templateIndex] = updatedTemplate;
      return { personaTemplate: updatedTemplate };
    }
      return { personaTemplate: undefined, error: 'Persona Template not found for update' };

  });
}
