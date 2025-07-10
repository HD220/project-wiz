import React, { useState } from "react";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import CreateProjectForm from "./create-project-form";

interface CreateProjectModalProps {
  onProjectCreated?: () => void;
}

function CreateProjectModal({ onProjectCreated }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronIPC.invoke(
        IpcChannel.PROJECT_CREATE,
        {
          name: projectName,
        },
      );
      if (result.success) {
        setProjectName("");
        setIsOpen(false);
        onProjectCreated?.();
      } else {
        setError(result.error?.message || "An unknown error occurred");
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setProjectName("");
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create New Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter the name for your new project.
          </DialogDescription>
        </DialogHeader>
        <CreateProjectForm
          projectName={projectName}
          setProjectName={setProjectName}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateProjectModal };
