import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AgentsSidebarErrorProps {
  error: string;
  onClearError: () => void;
}

export function AgentsSidebarError({
  error,
  onClearError,
}: AgentsSidebarErrorProps) {
  return (
    <div className="p-3 border-b border-border flex-none">
      <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md flex items-center justify-between">
        {error}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearError}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
