import { createFileRoute } from "@tanstack/react-router";

function AgentsIndex() {
  // Esta é a página index vazia - o conteúdo é renderizado pelo layout pai
  return null;
}

export const Route = createFileRoute("/_authenticated/user/agents/")({
  component: AgentsIndex,
});