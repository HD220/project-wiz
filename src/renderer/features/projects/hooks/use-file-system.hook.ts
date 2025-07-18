import { useQuery } from "@tanstack/react-query";
import { fileSystemService } from "../services/file-system.service";

export function useProjectFiles(projectId: string) {
  return useQuery({
    queryKey: ["fileSystem", "projectFiles", projectId],
    queryFn: () => fileSystemService.getProjectFiles(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useFileContent(filePath: string) {
  return useQuery({
    queryKey: ["fileSystem", "fileContent", filePath],
    queryFn: () => fileSystemService.getFileContent(filePath),
    enabled: !!filePath,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
}
