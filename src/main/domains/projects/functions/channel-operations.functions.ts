import { Project } from "../project.entity";
import {
  createChannel,
  findChannelsByProject as findChannelsByProjectCrud,
} from "./channel-crud.functions";
import { findProjectById } from "./project-crud.functions";
import type { ChannelDto } from "@/shared/types/domains/projects/channel.types";

export function findChannelsByProject(projectId: string): ChannelDto[] {
  return findChannelsByProjectCrud(projectId);
}

export function findAccessibleChannels(projectId: string): ChannelDto[] {
  // Agora que removemos isPrivate, todos os canais são acessíveis
  return findChannelsByProjectCrud(projectId);
}

export async function createGeneralChannel(
  projectId: string,
): Promise<ChannelDto> {
  const project = await findProjectById(projectId);
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }

  // Usar a factory estática do Channel para criar canal geral
  const { Channel } = await import("../channel.entity");
  const generalChannel = Channel.createGeneral(projectId);

  return createChannel({
    name: generalChannel.getName(),
    projectId: generalChannel.getProjectId(),
    description: generalChannel.getDescription(),
  });
}

export async function createChannelForProject(
  projectId: string,
  channelData: { name: string; description?: string },
): Promise<ChannelDto> {
  const project = await findProjectById(projectId);
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }

  // Usar a factory estática do Channel para criar canal
  const { Channel } = await import("../channel.entity");
  const channel = Channel.create({
    name: channelData.name,
    description: channelData.description,
    projectId,
  });

  return createChannel({
    name: channel.getName(),
    projectId: channel.getProjectId(),
    description: channel.getDescription(),
  });
}
