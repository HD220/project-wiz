import { Link, useRouteContext } from "@tanstack/react-router";
import { MoreHorizontal, Edit2, Trash2, Star, StarOff } from "lucide-react";
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
import { Card } from "@/renderer/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";

import {
  useDeleteLLMProvider,
  useSetDefaultLLMProvider,
} from "../hooks/use-llm-providers";

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

function ProviderCard(props: ProviderCardProps) {
  const { provider } = props;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteProviderMutation = useDeleteLLMProvider();
  const setDefaultProviderMutation = useSetDefaultLLMProvider();
  const { auth } = useRouteContext({ from: "__root__" });
  const { user } = auth;

  const isLoading =
    deleteProviderMutation.isPending || setDefaultProviderMutation.isPending;

  const handleDelete = async () => {
    try {
      if (!user?.id) throw new Error("User not authenticated");
      await deleteProviderMutation.mutateAsync({
        id: provider.id,
        userId: user.id,
      });
      toast.success("Provider deleted successfully");
    } catch (error) {
      toast.error("Failed to delete provider");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleSetDefault = async () => {
    try {
      if (!user?.id) throw new Error("User not authenticated");
      await setDefaultProviderMutation.mutateAsync({
        id: provider.id,
        userId: user.id,
      });
      toast.success("Default provider updated");
    } catch (error) {
      toast.error("Failed to update default provider");
    }
  };

  return (
    <>
      <Card
        className={`p-4 transition-colors hover:bg-accent/50 ${
          provider.isDefault ? "ring-1 ring-primary" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Icon and Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-xl shrink-0">🤖</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{provider.name}</h3>
                {provider.isDefault && (
                  <Badge variant="default" className="text-xs shrink-0">
                    Default
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {getProviderLabel(provider.type)} • {provider.defaultModel}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  provider.isActive ? "bg-green-500" : "bg-muted-foreground"
                }`}
              />
              <span className="text-sm text-muted-foreground">
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
                  to="/user/settings/llm-providers/edit/$providerId"
                  params={{ providerId: provider.id }}
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
