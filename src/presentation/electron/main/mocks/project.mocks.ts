// src/presentation/electron/main/mocks/project.mocks.ts
import { Project } from "@/core/domain/entities/project.entity";

// Using a Record for easier lookup by ID, similar to how a DB might work.
// The GET_PROJECTS_LIST handler will return Object.values(mockProjectsDb)
export const mockProjectsDb: Record<string, Project> = {
  mockId1: {
    id: "1",
    name: "Projeto Phoenix (Main)",
    description:
      "Reconstrução da plataforma principal com foco em escalabilidade e IA. Este projeto visa modernizar toda a stack tecnológica.",
    lastActivity: "2 horas atrás",
    status: "active",
    agentCount: 5,
    taskCount: 23,
  },
  mockId2: {
    id: "2",
    name: "Operação Quimera (Main)",
    description:
      "Integração de múltiplos serviços legados em uma nova arquitetura de microfrontends.",
    lastActivity: "1 dia atrás",
    status: "paused",
    agentCount: 2,
    taskCount: 8,
  },
  mockId3: {
    id: "3",
    name: "Iniciativa Netuno (Main)",
    description:
      "Desenvolvimento de um novo data lake para análise preditiva de mercado.",
    lastActivity: "5 dias atrás",
    status: "planning",
    agentCount: 1,
    taskCount: 2,
  },
  mockId4: {
    id: "4",
    name: "Projeto Alpha (Main)",
    description: "Um projeto de exploração de novas tecnologias de IA.",
    lastActivity: "3 horas atrás",
    status: "active",
    agentCount: 3,
    taskCount: 15,
  },
  mockId5: {
    id: "5",
    name: "Legado Modernizado (Main)",
    description: "Atualização de sistema legado para novas tecnologias.",
    lastActivity: "1 semana atrás",
    status: "completed",
    agentCount: 0,
    taskCount: 50,
  },
};

// Add more mock data or functions to manipulate this data if needed for simulating CUD operations.
// For example:
export function addMockProject(project: Project) {
  mockProjectsDb[project.id] = project;
}
export function updateMockProject(
  projectId: string,
  updates: Partial<Project>
): Project | undefined {
  const index = Object.values(mockProjectsDb).findIndex(
    (project) => project.id === projectId
  );
  if (index !== -1) {
    const currentProject = Object.values(mockProjectsDb)[index];
    const updated = {
      ...currentProject,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    mockProjectsDb[projectId] = updated;
    return updated;
  }
  return undefined;
}
