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
import { useIpcMutation } from "@/renderer/hooks/use-ipc-mutation.hook";
import type { IpcProjectCreatePayload } from "@/shared/ipc-types/ipc-payloads";
import type { IProject } from "@/shared/ipc-types/domain-types";

interface CreateProjectModalProps {
  onProjectCreated?: () => void;
}

function CreateProjectModal({ onProjectCreated }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const {
    mutate: createProject,
    isPending,
    error,
  } = useIpcMutation<IProject, Error, IpcProjectCreatePayload>({
    channel: IpcChannel.PROJECT_CREATE,
    onSuccess: () => {
      setProjectName("");
      setIsOpen(false);
      onProjectCreated?.();
    },
    onError: (err) => {
      // Error is handled by the form, so we just log it here if needed
      console.error("Failed to create project:", err);
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    createProject({ name: projectName });
  };

  const handleCancel = () => {
    setIsOpen(false);
    setProjectName("");
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
          loading={isPending}
          error={error?.message || null}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateProjectModal };
