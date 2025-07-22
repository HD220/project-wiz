import { Link } from "@tanstack/react-router";
import { Bot, Plus } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        <Bot className="h-12 w-12 text-muted-foreground/50" />
      </div>
      <div className="space-y-2 mb-6">
        <h3 className="text-lg font-medium">No AI Providers Configured</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Get started by adding your first AI provider to enable AI agents in
          your projects.
        </p>
      </div>
      <Link to="/user/settings/llm-providers/new">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Provider
        </Button>
      </Link>
    </div>
  );
}

export { EmptyState };
