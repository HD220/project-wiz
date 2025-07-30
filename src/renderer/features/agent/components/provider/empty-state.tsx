import { Plus, Server } from "lucide-react";

import { CustomLink } from "@/renderer/components/custom-link";

export function EmptyState() {
  return (
    <div className="flex flex-col h-full">
      {/* Professional Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Server className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              LLM Providers
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your AI providers and configurations
            </p>
          </div>
        </div>
        <CustomLink to="/user/settings/llm-providers/new" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Provider
        </CustomLink>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted/20 flex items-center justify-center mb-6">
          <Server className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          No providers configured yet
        </h3>
        <p className="text-base text-muted-foreground mb-8 max-w-lg leading-relaxed">
          Add your first AI provider to enable intelligent conversations and AI
          agents in your projects. Supports OpenAI, Anthropic, Google, DeepSeek,
          and custom providers.
        </p>
        <CustomLink
          to="/user/settings/llm-providers/new"
          size="lg"
          className="gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Your First Provider
        </CustomLink>
      </div>
    </div>
  );
}
