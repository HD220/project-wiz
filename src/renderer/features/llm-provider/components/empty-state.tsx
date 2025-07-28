import { Link } from "@tanstack/react-router";
import { Bot, Plus } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="max-w-sm space-y-6">
        {/* Simple Icon */}
        <div className="flex justify-center">
          <div className="relative bg-primary/10 p-4 rounded-full">
            <Bot className="size-8 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            No AI Providers Configured
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Add your first AI provider to enable intelligent conversations and
            AI agents in your projects.
          </p>
        </div>

        {/* Call-to-Action */}
        <div className="space-y-3">
          <Link
            to="/user/settings/llm-providers/$providerId/new"
            params={{ providerId: "new" }}
          >
            <Button className="gap-2 w-full">
              <Plus className="size-4" />
              Add Your First Provider
            </Button>
          </Link>

          <p className="text-xs text-muted-foreground">
            Supports OpenAI, Anthropic, Google, DeepSeek, and custom providers
          </p>
        </div>
      </div>
    </div>
  );
}
