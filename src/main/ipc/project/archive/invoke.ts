import { z } from "zod";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { archiveProject } from "@/main/ipc/project/queries";

const logger = getLogger("project.archive.invoke");

// Input schema - simplified to just project ID
const ArchiveProjectInputSchema = z.string().min(1);

// Output schema
const ArchiveProjectOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

type ArchiveProjectInput = z.infer<typeof ArchiveProjectInputSchema>;
type ArchiveProjectOutput = z.infer<typeof ArchiveProjectOutputSchema>;

export default async function (
  input: ArchiveProjectInput,
): Promise<ArchiveProjectOutput> {
  logger.debug("Archiving project", { projectId: input });

  // 1. Validate input
  const validatedProjectId = ArchiveProjectInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();

  // 3. Archive project with ownership validation
  const dbProject = await archiveProject(validatedProjectId, currentUser.id, currentUser.id);

  // 4. Mapeamento: SelectProject → ArchiveProjectOutput
  const apiResponse = {
    success: true,
    message: "Project archived successfully",
  };

  // 5. Validate output
  const result = ArchiveProjectOutputSchema.parse(apiResponse);

  logger.debug("Project archived", {
    projectId: dbProject.id,
    name: dbProject.name,
  });

  return result;
}

declare global {
  namespace WindowAPI {
    interface Project {
      archive: (id: string) => Promise<ArchiveProjectOutput>;
    }
  }
}
