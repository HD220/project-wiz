import { Bot, Plus } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent, CardHeader } from "@/renderer/components/ui/card";

interface EmptyStateProps {
  onAddProvider: () => void;
}

function EmptyState(props: EmptyStateProps) {
  const { onAddProvider } = props;

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No AI Providers Configured</h3>
            <p className="text-muted-foreground max-w-md">
              Get started by adding your first AI provider. Connect with OpenAI, DeepSeek, 
              Anthropic, or any custom provider to start using AI agents.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Button onClick={onAddProvider} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Provider
        </Button>
      </CardContent>
    </Card>
  );
}

export { EmptyState };