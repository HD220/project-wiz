import React from "react";

import type { IProject } from "@/shared/ipc-types/domain-types";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { useIpcQuery } from "@/renderer/hooks/use-ipc-query.hook";
import { useIpcMutation } from "@/renderer/hooks/use-ipc-mutation.hook";
import type { IpcProjectRemovePayload } from "@/shared/ipc-types/ipc-payloads";

export function ProjectSidebar() {
  const {
    data: projects,
    isLoading,
    error,
    refetch: fetchProjects,
  } = useIpcQuery<IProject[]>({
    channel: IpcChannel.PROJECT_LIST,
  });

  const { mutate: removeProject } = useIpcMutation<
    void,
    Error,
    IpcProjectRemovePayload
  >({
    channel: IpcChannel.PROJECT_REMOVE,
    onSuccess: () => {
      fetchProjects();
    },
    onError: (err) => {
      alert(`Error removing project: ${err.message}`);
    },
  });

  const handleRemoveProject = (id: string) => {
    removeProject({ id });
  };

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="w-64 bg-gray-100 p-4 border-r border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      <ul>
        {projects?.map((project) => (
          <li
            key={project.id}
            className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
          >
            <span>{project.name}</span>
            <button
              onClick={() => handleRemoveProject(project.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
