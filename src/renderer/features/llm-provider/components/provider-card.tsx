import { Link } from "@tanstack/react-router";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Star,
  StarOff,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { cn } from "@/renderer/lib/utils";

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

const getProviderIcon = (type: string): string => {
  const icons: Record<string, string> = {
    openai: "AI",
    deepseek: "DS",
    anthropic: "AN",
    google: "GO",
    custom: "CU",
  };
  return icons[type] || "AI";
};

interface ProviderCardProps {
  provider: LlmProvider;
}

export function ProviderCard(props: ProviderCardProps) {
  const { provider } = props;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Delete provider mutation with inline messages
  const deleteProviderMutation = useApiMutation(
    (id: string) => window.api.llmProviders.delete(id),
    {
      successMessage: "Provider deleted successfully",
      errorMessage: "Failed to delete provider",
      invalidateRouter: true,
    },
  );

  // Custom mutation for setting default (no userId parameter needed now)
  const setDefaultProviderMutation = useApiMutation<
    string,
    { message: string }
  >((id: string) => window.api.llmProviders.setDefault(id), {
    successMessage: "Default provider updated",
    errorMessage: "Failed to update default provider",
  });

  const isLoading =
    deleteProviderMutation.isPending || setDefaultProviderMutation.isPending;

  function handleDelete() {
    deleteProviderMutation.mutate(provider.id);
    setShowDeleteDialog(false);
  }

  function handleSetDefault() {
    setDefaultProviderMutation.mutate(provider.id);
  }

  return (
    <>
      {/* Compact Discord-style Provider Card */}
      <div
        className={cn(
          "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-150",
          "hover:bg-accent/50 hover:border-accent-foreground/20",
          provider.isDefault
            ? "bg-primary/5 border-primary/20"
            : "bg-card border-border",
          isLoading && "opacity-50 pointer-events-none",
        )}
      >
        {/* Provider Icon */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "flex items-center justify-center size-10 rounded-full text-xs font-bold",
              provider.isDefault
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {getProviderIcon(provider.type)}
          </div>
          {/* Status dot */}
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card",
              provider.isActive ? "bg-green-500" : "bg-gray-400",
            )}
          />
          {/* Default indicator */}
          {provider.isDefault && (
            <div className="absolute -top-0.5 -left-0.5 size-3 bg-primary rounded-full flex items-center justify-center">
              <Star className="size-1.5 text-primary-foreground fill-current" />
            </div>
          )}
        </div>

        {/* Provider Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-foreground truncate">
              {provider.name}
            </h3>
            {provider.isDefault && (
              <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                Default
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{getProviderLabel(provider.type)}</span>
            <span>•</span>
            <span className="truncate">{provider.defaultModel}</span>
            {provider.baseUrl && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ExternalLink className="size-3" />
                  Custom
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          <Badge
            variant={provider.isActive ? "default" : "secondary"}
            className={cn(
              "h-5 px-2 text-xs",
              provider.isActive
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-gray-500/10 text-gray-600 border-gray-500/20",
            )}
          >
            {provider.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Actions Menu */}
        <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isLoading}
                aria-label={`Actions for ${provider.name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link
                  to="/user/settings/llm-providers/$providerId/edit"
                  params={{ providerId: provider.id }}
                  search={{}}
                  className="cursor-pointer"
                >
                  <Edit2 className="mr-2 size-4" />
                  Edit
                </Link>
              </DropdownMenuItem>

              {!provider.isDefault && (
                <DropdownMenuItem onClick={handleSetDefault}>
                  <Star className="mr-2 size-4" />
                  Set Default
                </DropdownMenuItem>
              )}

              {provider.isDefault && (
                <DropdownMenuItem disabled>
                  <StarOff className="mr-2 size-4" />
                  Current Default
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{provider.name}&quot;? This
              action cannot be undone.
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
