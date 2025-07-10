import React, { useState, useEffect, useCallback } from "react";

import { IProject } from "@/shared/ipc-types/entities";

export function ProjectSidebar() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronIPC.invoke("project:list");
      if (result.success) {
        setProjects(result.data || []);
      } else {
        setError(result.error?.message || "An unknown error occurred");
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemoveProject = async (id: string) => {
    try {
      const result = await window.electronIPC.invoke("project:remove", { id });
      if (result.success) {
        fetchProjects();
      } else {
        alert(
          `Error removing project: ${result.error?.message || "An unknown error occurred"}`,
        );
      }
    } catch (err: unknown) {
      alert(`Error removing project: ${(err as Error).message}`);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-64 bg-gray-100 p-4 border-r border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      <ul>
        {projects.map((project) => (
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
