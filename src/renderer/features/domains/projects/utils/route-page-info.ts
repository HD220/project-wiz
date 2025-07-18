import type { AgentDto } from "../../../../shared/types/agents/agent.types";
import type { ChannelDto } from "../../../../shared/types/projects/channel.types";
import type { ProjectDto } from "../../../../shared/types/projects/project.types";

type PageInfo = {
  title: string;
  subtitle?: string;
  type: "project" | "channel" | "agent" | "chat" | "docs" | "files" | "tasks";
  memberCount?: number;
};

export function getPageInfo(
  pathname: string,
  channels: ChannelDto[] = [],
  agents: AgentDto[] = [],
  currentProject: ProjectDto | null = null,
): PageInfo {
  // Extract segments from path
  const segments = pathname.split("/").filter(Boolean);

  // Base project info
  if (segments.length === 2 && segments[0] === "project") {
    return {
      title: currentProject?.name || "Project",
      subtitle: "Dashboard",
      type: "project",
      memberCount: 5,
    };
  }

  // Chat channel
  if (segments.includes("chat") && segments.length === 4) {
    const channelId = segments[3];
    const channel = channels.find((c) => c.id === channelId);
    return {
      title: channel?.name || "Channel",
      subtitle: "Project Chat",
      type: "channel",
      memberCount: 3,
    };
  }

  // Agent page
  if (segments.includes("agent") && segments.length === 4) {
    const agentId = segments[3];
    const agent = agents.find((a) => a.id === agentId);
    return {
      title: agent?.name || "Agent",
      subtitle: "AI Assistant",
      type: "agent",
      memberCount: 1,
    };
  }

  // Agents list
  if (segments.includes("agents")) {
    return {
      title: "Agents",
      subtitle: "AI Assistants",
      type: "agent",
      memberCount: agents.length,
    };
  }

  // Chat index
  if (segments.includes("chat") && segments.length === 3) {
    return {
      title: "Chat",
      subtitle: "Team Communication",
      type: "chat",
      memberCount: 5,
    };
  }

  // Docs
  if (segments.includes("docs")) {
    return {
      title: "Documentation",
      subtitle: "Project Docs",
      type: "docs",
    };
  }

  // Files
  if (segments.includes("files")) {
    return {
      title: "Files",
      subtitle: "Project Files",
      type: "files",
    };
  }

  // Tasks
  if (segments.includes("tasks")) {
    return {
      title: "Tasks",
      subtitle: "Project Tasks",
      type: "tasks",
    };
  }

  // Default fallback
  return {
    title: currentProject?.name || "Project",
    subtitle: "Unknown Page",
    type: "project",
  };
}
