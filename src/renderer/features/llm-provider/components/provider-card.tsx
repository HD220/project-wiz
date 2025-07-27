import { Link } from "@tanstack/react-router";
import { MoreHorizontal, Edit2, Trash2, Star, StarOff } from "lucide-react";
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
import { Card, CardContent } from "@/renderer/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

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
      <Card
        className={`transition-colors hover:bg-accent/50 ${
          provider.isDefault ? "ring-1 ring-primary" : ""
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Icon and Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="text-xl shrink-0">🤖</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-medium truncate">
                    {provider.name}
                  </h3>
                  {provider.isDefault && (
                    <Badge variant="default" className="text-xs shrink-0">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-base text-muted-foreground truncate">
                  {getProviderLabel(provider.type)} • {provider.defaultModel}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    provider.isActive ? "bg-primary" : "bg-muted-foreground"
                  }`}
                />
                <span className="text-base text-muted-foreground">
                  {provider.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Actions Menu */}
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
                  <Link
                    to="/user/settings/llm-providers/$providerId/edit"
                    params={{ providerId: provider.id }}
                    search={{}}
                  >
                    <DropdownMenuItem>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </Link>

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
          </div>
        </CardContent>
      </Card>

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
