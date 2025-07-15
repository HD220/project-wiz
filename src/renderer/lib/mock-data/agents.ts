import { Agent } from "./types";

export const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Assistente",
    description: "Assistente geral para ajuda e orientação",
    avatar: "🤖",
    status: "online",
    type: "assistant",
    capabilities: ["chat", "help", "planning", "documentation"],
    projectId: "proj-1",
    isExecuting: false,
  },
  {
    id: "agent-2",
    name: "Code Reviewer",
    description: "Especialista em revisão de código e qualidade",
    avatar: "👨‍💻",
    status: "executing",
    type: "code-reviewer",
    capabilities: ["code-review", "testing", "refactoring", "security"],
    currentTask: "Analisando componentes React...",
    projectId: "proj-1",
    isExecuting: true,
    executionProgress: 65,
  },
  {
    id: "agent-3",
    name: "DevOps Engineer",
    description: "Especialista em infraestrutura e deployment",
    avatar: "⚙️",
    status: "away",
    type: "devops",
    capabilities: ["deployment", "monitoring", "docker", "ci-cd"],
    projectId: "proj-1",
    isExecuting: false,
  },
  {
    id: "agent-4",
    name: "Project Manager",
    description: "Gerenciamento de projetos e coordenação de tarefas",
    avatar: "📋",
    status: "online",
    type: "project-manager",
    capabilities: ["planning", "coordination", "reporting", "estimation"],
    projectId: "proj-1",
    isExecuting: false,
  },
  {
    id: "agent-5",
    name: "Frontend Specialist",
    description: "Especialista em desenvolvimento frontend",
    avatar: "🎨",
    status: "busy",
    type: "custom",
    capabilities: ["react", "typescript", "ui-ux", "responsive-design"],
    currentTask: "Criando componentes UI...",
    projectId: "proj-1",
    isExecuting: true,
    executionProgress: 30,
  },
];

export const getAgentById = (id: string): Agent | undefined => {
  return mockAgents.find(agent => agent.id === id);
};

export const getAgentsByProject = (projectId: string): Agent[] => {
  return mockAgents.filter(agent => agent.projectId === projectId);
};