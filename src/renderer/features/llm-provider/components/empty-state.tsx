import { Link } from "@tanstack/react-router";
import { Bot, Plus, Sparkles, Zap } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent } from "@/renderer/components/ui/card";
import { cn } from "@/renderer/lib/utils";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-[var(--spacing-layout-xl)] text-center">
      <Card className="max-w-md w-full bg-gradient-to-br from-primary/10 via-primary/5 to-primary/0 border border-border/60 backdrop-blur-sm">
        <CardContent className="pt-[var(--spacing-layout-lg)] pb-[var(--spacing-layout-lg)] px-[var(--spacing-layout-lg)]">
          {/* Enhanced Icon with Animation */}
          <div className="relative mb-[var(--spacing-layout-sm)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-full border border-primary/20 mx-auto w-fit">
              <Bot className="size-12 text-primary" />
              {/* Floating decorative elements */}
              <Sparkles
                className="absolute -top-2 -right-2 size-4 text-chart-4 animate-bounce"
                style={{ animationDelay: "0.5s" }}
              />
              <Zap
                className="absolute -bottom-1 -left-1 size-3 text-chart-1 animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>
          </div>

          {/* Enhanced Content */}
          <div className="space-y-[var(--spacing-component-md)] mb-[var(--spacing-layout-sm)]">
            <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              No AI Providers Configured
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              Get started by adding your first AI provider to enable powerful AI
              agents and unlock intelligent conversations in your projects.
            </p>
          </div>

          {/* Enhanced Call-to-Action */}
          <div className="space-y-[var(--spacing-component-sm)]">
            <Link
              to="/user/settings/llm-providers/$providerId/new"
              params={{ providerId: "new" }}
            >
              <Button
                className={cn(
                  "gap-[var(--spacing-component-sm)] shadow-sm w-full",
                  "bg-gradient-to-r from-primary to-primary/90",
                  "hover:from-primary/90 hover:to-primary/80",
                  "transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
                )}
                size="lg"
              >
                <Plus className="size-4" />
                Add Your First Provider
              </Button>
            </Link>

            {/* Helper Text */}
            <p className="text-xs text-muted-foreground">
              Supports OpenAI, Anthropic, Google, DeepSeek, and custom providers
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
