import { Project } from "../project.entity";
import {
  createChannel,
  findChannelsByProject as findChannelsByProjectCrud,
} from "./channel-crud.functions";
import { findProjectById } from "./project-query.functions";
import type { ChannelDto } from "../../../../shared/types/domains/projects/channel.types";

export function findChannelsByProject(projectId: string): ChannelDto[] {
  return findChannelsByProjectCrud(projectId);
}

export function findAccessibleChannels(projectId: string): ChannelDto[] {
  // Agora que removemos isPrivate, todos os canais são acessíveis
  return findChannelsByProjectCrud(projectId);
}

export function createGeneralChannel(projectId: string): ChannelDto {
  const projectData = findProjectById(projectId);
  if (!projectData) {
    throw new Error(`Project with ID ${projectId} not found`);
  }

  const project = Project.create({
    id: projectData.id,
    name: projectData.name,
  });

  const generalChannel = project.createGeneralChannel();

  return createChannel({
    name: generalChannel.getName(),
    projectId: generalChannel.getProjectId(),
    description: generalChannel.getDescription(),
  });
}

export function createChannelForProject(
  projectId: string,
  channelData: { name: string; description?: string },
): ChannelDto {
  const projectData = findProjectById(projectId);
  if (!projectData) {
    throw new Error(`Project with ID ${projectId} not found`);
  }

  const project = Project.create({
    id: projectData.id,
    name: projectData.name,
  });

  const channel = project.createChannel(channelData);

  return createChannel({
    name: channel.getName(),
    projectId: channel.getProjectId(),
    description: channel.getDescription(),
  });
}
