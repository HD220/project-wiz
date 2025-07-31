import { createFileRoute } from "@tanstack/react-router";

function ChannelIndex() {
  // Esta é a página index vazia - o conteúdo é renderizado pelo layout pai
  return null;
}

export const Route = createFileRoute(
  "/_authenticated/project/$projectId/channel/$channelId/",
)({
  component: ChannelIndex,
});
