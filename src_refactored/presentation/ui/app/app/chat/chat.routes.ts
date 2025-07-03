import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ChatPage } from "./index";

export const chatSearchSchema = z.object({
  conversationId: z.string().optional(),
});

export const Route = createFileRoute("/app/chat/")({
  component: ChatPage,
  validateSearch: (search) => chatSearchSchema.parse(search),
});
