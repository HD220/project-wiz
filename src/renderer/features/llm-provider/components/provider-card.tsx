import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Star,
  StarOff,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/renderer/components/ui/alert-dialog";
import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent, CardHeader } from "@/renderer/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";

// Simple utility functions
const maskApiKey = (apiKey: string): string => {
  if (apiKey.length <= 8) return "●".repeat(apiKey.length);
  return `${apiKey.slice(0, 4)}${"●".repeat(Math.max(0, apiKey.length - 8))}${apiKey.slice(-4)}`;
};

const getProviderLabel = (type: string): string => {
  const labels: Record<string, string> = {
    openai: "OpenAI",
    deepseek: "DeepSeek",
    anthropic: "Anthropic",
    google: "Google",
    custom: "Custom",
  };
  return labels[type] || "Unknown";
};
import { useLLMProvidersStore } from "@/renderer/store/llm-provider.store";

interface ProviderCardProps {
  provider: LlmProvider;
  onEdit: (provider: LlmProvider) => void;
}

function ProviderCard(props: ProviderCardProps) {
  const { provider, onEdit } = props;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const { deleteProvider, setDefaultProvider, isLoading } =
    useLLMProvidersStore();

  const handleDelete = async () => {
    try {
      await deleteProvider(provider.id);
      toast.success("Provider deleted successfully");
    } catch (error) {
      toast.error("Failed to delete provider");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleSetDefault = async () => {
    try {
      await setDefaultProvider(provider.id);
      toast.success("Default provider updated");
    } catch (error) {
      toast.error("Failed to update default provider");
    }
  };

  const displayApiKey = showApiKey
    ? provider.apiKey
    : maskApiKey(provider.apiKey);

  return (
    <>
      <Card
        className={`transition-colors hover:bg-accent/50 ${
          provider.isDefault ? "ring-2 ring-primary" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{provider.name}</h3>
                  {provider.isDefault && (
                    <Badge variant="default" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getProviderLabel(provider.type)} • {provider.defaultModel}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(provider)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>

                {!provider.isDefault && (
                  <DropdownMenuItem onClick={handleSetDefault}>
                    <Star className="mr-2 h-4 w-4" />
                    Set as Default
                  </DropdownMenuItem>
                )}

                {provider.isDefault && (
                  <DropdownMenuItem disabled>
                    <StarOff className="mr-2 h-4 w-4" />
                    Current Default
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* API Key Display */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                API Key
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-2 py-1 text-xs font-mono">
                  {displayApiKey}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Base URL if present */}
            {provider.baseUrl && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Base URL
                </label>
                <code className="block rounded bg-muted px-2 py-1 text-xs font-mono">
                  {provider.baseUrl}
                </code>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center justify-between">
              <Badge
                variant={provider.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {provider.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{provider.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { ProviderCard };
