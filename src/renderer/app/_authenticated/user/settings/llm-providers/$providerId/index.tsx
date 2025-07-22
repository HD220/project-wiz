import { createFileRoute } from "@tanstack/react-router";

function ProviderIndex() {
  // Esta é a página index vazia - o conteúdo é renderizado pelos filhos
  return null;
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/$providerId/",
)({
  component: ProviderIndex,
});
