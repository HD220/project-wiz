import { useState } from "react";

import { useProjects } from "./use-projects.hook";

export function useCreateProjectModal() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gitUrl, setGitUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createProject } = useProjects();

  const resetForm = () => {
    setName("");
    setDescription("");
    setGitUrl("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        gitUrl: gitUrl.trim() || undefined,
      });
      resetForm();
      return true;
    } catch (error) {
      console.error("Error creating project:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    gitUrl,
    setGitUrl,
    isSubmitting,
    handleSubmit,
    resetForm,
  };
}
