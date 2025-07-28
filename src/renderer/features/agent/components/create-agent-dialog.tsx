import { Bot, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import type { LlmProvider } from "@/renderer/features/agent/provider.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import type { CreateAgentInput } from "@/renderer/features/agent/agent.types";
import { AgentForm } from "@/renderer/features/agent/components/agent-form";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

interface CreateAgentDialogProps {
  open: boolean;
  onClose: () => void;
  onAgentCreated?: () => void;
}

export function CreateAgentDialog(props: CreateAgentDialogProps) {
  const { open, onClose, onAgentCreated } = props;
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  // Load providers when dialog opens
  useEffect(() => {
    if (!open) return;

    async function loadProviders() {
      setIsLoadingProviders(true);
      try {
        const response = await window.api.llmProviders.list();
        if (response.success) {
          setProviders(response.data as LlmProvider[]);
        } else {
          console.error("Failed to load providers:", response.error);
        }
      } catch (error) {
        console.error("Error loading providers:", error);
      } finally {
        setIsLoadingProviders(false);
      }
    }

    loadProviders();
  }, [open]);

  // Agent creation mutation
  const createAgentMutation = useApiMutation(
    (data: CreateAgentInput) => window.api.agents.create(data),
    {
      successMessage: "Agent created successfully",
      errorMessage: "Failed to create agent",
      invalidateRouter: true,
      onSuccess: () => {
        onClose();
        onAgentCreated?.();
      },
    },
  );

  function handleClose() {
    // Don't close if mutation is pending
    if (createAgentMutation.isPending) return;
    onClose();
  }

  async function handleSubmit(data: CreateAgentInput) {
    try {
      createAgentMutation.mutate(data);
    } catch (error) {
      // Error handling is done by useApiMutation
      console.error("Error in handleSubmit:", error);
    }
  }

  function handleCancel() {
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 border-border/80">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/50 shrink-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Bot className="size-4 text-primary" />
            </div>
            Create New Agent
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoadingProviders ? (
            // Loading state
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading providers...
                </p>
              </div>
            </div>
          ) : (
            // Agent form - remove extra scrolling since AgentForm has its own
            <div className="h-full">
              <AgentForm
                providers={providers}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createAgentMutation.isPending}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
