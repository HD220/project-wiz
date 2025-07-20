import { Card, CardContent } from "@/components/ui/card";
import { Plus, Bot } from "lucide-react";

export function EmptyProviderState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Bot className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No LLM providers configured
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Get started by adding your first AI model provider. You'll need an API key from 
          a supported provider like OpenAI, DeepSeek, or Anthropic.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Plus className="h-4 w-4" />
          <span>Use the form above to add your first provider</span>
        </div>
      </CardContent>
    </Card>
  );
}