import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";

import { ProjectForm } from "./project-form";

interface CreateProjectDialogProps {
  children: React.ReactNode;
  userId: string;
  onSuccess?: () => void;
}

function CreateProjectDialog(props: CreateProjectDialogProps) {
  const { children, userId, onSuccess } = props;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleSuccess(projectId: string) {
    setOpen(false);

    // Navigate to the new project
    navigate({
      to: "/project/$projectId",
      params: { projectId },
    });

    // Call optional success callback
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
          <DialogDescription>
            Crie um novo projeto para organizar seu trabalho e colaborar com seu
            time.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm
          userId={userId}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateProjectDialog };
