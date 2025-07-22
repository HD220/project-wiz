import { createFileRoute } from "@tanstack/react-router";

function LLMProvidersIndex() {
  // Esta é a página index vazia - o conteúdo é renderizado pelo layout pai
  return null;
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/",
)({
  component: LLMProvidersIndex,
});
