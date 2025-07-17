import {
  Channel,
  Agent,
  Project,
  PageInfo,
} from "@/shared/types/page-info.types";

function getChannelPageInfo(pathname: string, channels: Channel[]): PageInfo {
  const channelId = pathname.split("/chat/")[1];
  const selectedChannel = channels.find((channel) => channel.id === channelId);
  return {
    title: selectedChannel ? `#${selectedChannel.name}` : "Chat",
    subtitle: selectedChannel?.name || "Canal de chat do projeto",
    type: "channel" as const,
    memberCount: 0,
  };
}

function getAgentPageInfo(pathname: string, agents: Agent[]): PageInfo {
  const agentId = pathname.split("/agent/")[1];
  const selectedAgent = agents.find((agent) => agent.id === agentId);
  return {
    title: selectedAgent ? `@${selectedAgent.name}` : "Mensagem Direta",
    subtitle: selectedAgent
      ? `Conversa com ${selectedAgent.name}`
      : "Mensagem direta com agente",
    type: "channel" as const,
    memberCount: 1,
  };
}

function getAgentsPageInfo(currentProject: Project | null): PageInfo {
  return {
    title: "Agentes",
    subtitle: `Gerenciamento de agentes do ${currentProject?.name}`,
    type: "page" as const,
  };
}

function getFilesPageInfo(): PageInfo {
  return {
    title: "Arquivos",
    subtitle: "Explorador de arquivos do projeto",
    type: "page" as const,
  };
}

function getTasksPageInfo(): PageInfo {
  return {
    title: "Tarefas",
    subtitle: "Gerenciamento de tarefas e issues",
    type: "page" as const,
  };
}

function getDocsPageInfo(): PageInfo {
  return {
    title: "Documentação",
    subtitle: "Documentos e wikis do projeto",
    type: "page" as const,
  };
}

function getDefaultPageInfo(currentProject: Project | null): PageInfo {
  return {
    title: currentProject?.name || "Projeto",
    subtitle: "Visão geral do projeto",
    type: "project" as const,
  };
}

export function getPageInfo(
  pathname: string,
  channels: Channel[],
  agents: Agent[],
  currentProject: Project | null,
): PageInfo {
  if (pathname.includes("/chat/")) {
    return getChannelPageInfo(pathname, channels);
  }

  if (pathname.includes("/agent/")) {
    return getAgentPageInfo(pathname, agents);
  }

  if (pathname.includes("/agents")) {
    return getAgentsPageInfo(currentProject);
  }

  if (pathname.includes("/files")) {
    return getFilesPageInfo();
  }

  if (pathname.includes("/tasks")) {
    return getTasksPageInfo();
  }

  if (pathname.includes("/docs")) {
    return getDocsPageInfo();
  }

  return getDefaultPageInfo(currentProject);
}
