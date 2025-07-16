import {
  Channel,
  Agent,
  Project,
  PageInfo,
} from "@/shared/types/page-info.types";

export function getPageInfo(
  pathname: string,
  channels: Channel[],
  agents: Agent[],
  currentProject: Project | null,
): PageInfo {
  if (pathname.includes("/chat/")) {
    const channelId = pathname.split("/chat/")[1];
    const selectedChannel = channels.find(
      (channel) => channel.id === channelId,
    );
    return {
      title: selectedChannel ? `#${selectedChannel.name}` : "Chat",
      subtitle: selectedChannel?.name || "Canal de chat do projeto",
      type: "channel" as const,
      memberCount: 0,
    };
  }

  if (pathname.includes("/agent/")) {
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

  if (pathname.includes("/agents")) {
    return {
      title: "Agentes",
      subtitle: `Gerenciamento de agentes do ${currentProject?.name}`,
      type: "page" as const,
    };
  }

  if (pathname.includes("/files")) {
    return {
      title: "Arquivos",
      subtitle: "Explorador de arquivos do projeto",
      type: "page" as const,
    };
  }

  if (pathname.includes("/tasks")) {
    return {
      title: "Tarefas",
      subtitle: "Gerenciamento de tarefas e issues",
      type: "page" as const,
    };
  }

  if (pathname.includes("/docs")) {
    return {
      title: "Documentação",
      subtitle: "Documentos e wikis do projeto",
      type: "page" as const,
    };
  }

  return {
    title: currentProject?.name || "Projeto",
    subtitle: "Visão geral do projeto",
    type: "project" as const,
  };
}
