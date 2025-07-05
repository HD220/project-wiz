import { ipcMain } from 'electron';

import {
  IPC_CHANNELS
} from '../../../../shared/ipc-channels';
import {
  GetPersonaTemplatesListResponseData,
  GetPersonaTemplateDetailsRequest,
  GetPersonaTemplateDetailsResponseData,
  CreatePersonaTemplateRequest,
  CreatePersonaTemplateResponseData,
  UpdatePersonaTemplateRequest,
  UpdatePersonaTemplateResponseData,
} from '../../../../shared/ipc-types';
import { PersonaTemplate } from '../../../../shared/types/entities';
import { mockPersonaTemplates } from '../mocks/persona-template.mocks';

export function registerPersonaTemplateHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_PERSONA_TEMPLATES_LIST, async (): Promise<GetPersonaTemplatesListResponseData> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, data: mockPersonaTemplates };
  });

  ipcMain.handle(IPC_CHANNELS.GET_PERSONA_TEMPLATE_DETAILS, async (_event, req: GetPersonaTemplateDetailsRequest): Promise<GetPersonaTemplateDetailsResponseData> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const template = mockPersonaTemplates.find(pt => pt.id === req.templateId);
    if (template) {
      return { success: true, data: template };
    }
    return { success: false, error: { message: 'Persona Template not found' } };
  });

  ipcMain.handle(IPC_CHANNELS.CREATE_PERSONA_TEMPLATE, async (_event, req: CreatePersonaTemplateRequest): Promise<CreatePersonaTemplateResponseData> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const newTemplate: PersonaTemplate = {
      id: `pt-${Date.now()}`,
      name: req.name,
      role: req.role,
      goal: req.goal,
      description: req.description ?? undefined,
      systemPrompt: req.systemPrompt,
      visionEnabled: req.visionEnabled ?? false,
      exampleConversations: req.exampleConversations ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // In a real scenario, you'd add this to your persistent or in-memory store
    mockPersonaTemplates.push(newTemplate);
    return { success: true, data: newTemplate };
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_PERSONA_TEMPLATE, async (_event, req: UpdatePersonaTemplateRequest): Promise<UpdatePersonaTemplateResponseData> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const templateIndex = mockPersonaTemplates.findIndex(pt => pt.id === req.templateId);
    if (templateIndex !== -1) {
      const updatedTemplate = { ...mockPersonaTemplates[templateIndex], ...req.data, updatedAt: new Date().toISOString() };
      mockPersonaTemplates[templateIndex] = updatedTemplate;
      return { success: true, data: updatedTemplate } as UpdatePersonaTemplateResponseData;
    }
    return { success: false, error: { message: 'Persona Template not found for update' } };
  });
}
