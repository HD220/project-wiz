import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { CreateChannelModal } from "@/domains/projects/components";

export function CreateChannelPage() {
  const navigate = useNavigate();
  // TODO: Get projectId from route params or context
  const projectId = "temp-project-id"; // Placeholder

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Volta para a página anterior quando o modal é fechado
      navigate({ to: ".." });
    }
  };

  return (
    <CreateChannelModal
      open={true}
      onOpenChange={handleOpenChange}
      projectId={projectId}
    />
  );
}

export const Route = createFileRoute("/create-channel")({
  component: CreateChannelPage,
});
