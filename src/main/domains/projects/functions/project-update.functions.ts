import { Project } from "../entities/project.entity";
import { UpdateProjectDto } from "../../shared/types/project.types";

export async function updateProject(data: UpdateProjectDto): Promise<Project> {
  // Placeholder implementation
  console.log(`Updating project: ${JSON.stringify(data)}`);
  return {} as Project;
}
