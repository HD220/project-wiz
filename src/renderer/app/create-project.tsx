import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { CreateProjectModal } from "@/domains/projects/components";

export function CreateProjectPage() {
  const navigate = useNavigate();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Volta para a página anterior quando o modal é fechado
      navigate({ to: ".." });
    }
  };

  return <CreateProjectModal open={true} onOpenChange={handleOpenChange} />;
}

export const Route = createFileRoute("/create-project")({
  component: CreateProjectPage,
});
