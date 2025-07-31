import { createFileRoute } from "@tanstack/react-router";

function LLMProvidersIndex() {
  // This is the empty index page - content is rendered by the parent layout
  return null;
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/",
)({
  component: LLMProvidersIndex,
});
