import { ipcMain } from 'electron';

import { PersonaTemplate } from "@/domain/entities/persona";

import { IPC_CHANNELS } from '@/shared/ipc-channels.constants';
import { GetPersonaTemplateDetailsRequest, CreatePersonaTemplateRequest, UpdatePersonaTemplateRequest } from '@/shared/ipc-types/persona.types';

import { mockPersonaTemplates } from '../mocks/persona-template.mocks';

export function registerPersonaTemplateHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_PERSONA_TEMPLATES_LIST, async (): Promise<PersonaTemplate[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockPersonaTemplates;
  });

  ipcMain.handle(IPC_CHANNELS.GET_PERSONA_TEMPLATE_DETAILS, async (_event, req: GetPersonaTemplateDetailsRequest): Promise<PersonaTemplate | null> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const template = mockPersonaTemplates.find(pt => pt.id === req.templateId);
    if (template) {
      return template;
    }
    throw new Error('Persona Template not found');
  });

  ipcMain.handle(IPC_CHANNELS.CREATE_PERSONA_TEMPLATE, async (_event, req: CreatePersonaTemplateRequest): Promise<PersonaTemplate> => {
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
    return newTemplate;
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_PERSONA_TEMPLATE, async (_event, req: UpdatePersonaTemplateRequest): Promise<PersonaTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const templateIndex = mockPersonaTemplates.findIndex(pt => pt.id === req.templateId);
    if (templateIndex !== -1) {
      const updatedTemplate = { ...mockPersonaTemplates[templateIndex], ...req.data, updatedAt: new Date().toISOString() };
      mockPersonaTemplates[templateIndex] = updatedTemplate;
      return updatedTemplate;
    }
    throw new Error('Persona Template not found for update');
  });
}
