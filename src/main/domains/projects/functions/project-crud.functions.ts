import { z } from "zod";
import { createEntityCrud } from "../../../infrastructure/crud-operations";
import { projects } from "../../../persistence/schemas/projects.schema";
import { Project } from "../project.entity";

// Schemas para validação
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().default(""),
  gitUrl: z.string().url().optional().nullable(),
  status: z.enum(["active", "archived", "maintenance"]).default("active"),
  avatar: z.string().nullable().default(null),
});

const updateProjectSchema = createProjectSchema.partial();

// Factory function para criar entidade Project a partir dos dados do banco
function projectFactory(data: any): Project {
  return new Project(data);
}

// CRUD operations usando a infraestrutura genérica
export const projectCrud = createEntityCrud({
  table: projects,
  entityName: "Project",
  createSchema: createProjectSchema,
  updateSchema: updateProjectSchema,
  entityFactory: projectFactory,
});

// Re-export das operações CRUD com nomes específicos do domínio
export const createProject = projectCrud.create;
export const findProjectById = projectCrud.findById;
export const findAllProjects = projectCrud.findAll;
export const updateProject = projectCrud.update;
export const deleteProject = projectCrud.delete;

// Operações específicas do domínio usando a infraestrutura genérica
export async function archiveProject(id: string): Promise<Project> {
  return updateProject(id, { status: "archived" });
}

export async function activateProject(id: string): Promise<Project> {
  return updateProject(id, { status: "active" });
}

export async function setProjectMaintenance(id: string): Promise<Project> {
  return updateProject(id, { status: "maintenance" });
}

// Queries específicas mantendo compatibilidade
export async function findProjectsByStatus(
  status: "active" | "archived" | "maintenance",
): Promise<Project[]> {
  // Para queries específicas que precisam de filtros, mantemos implementação própria
  // mas aproveitamos o logger e tratamento de erros da infraestrutura
  const db = require("../../../infrastructure/database").getDatabase();
  const { eq } = require("drizzle-orm");

  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.status, status));

  return result.map(projectFactory);
}
