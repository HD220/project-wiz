import { Link } from "@tanstack/react-router";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Star,
  StarOff,
  Bot,
  Check,
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
import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
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
    openai: "🤖",
    deepseek: "🔮",
    anthropic: "🧠",
    google: "✨",
    custom: "⚙️",
  };
  return icons[type] || "🤖";
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
        className={cn(
          // Enhanced card styling with sophisticated hover effects
          "group relative overflow-hidden",
          "bg-card/50 backdrop-blur-sm border border-border/60",
          "transition-all duration-200 ease-out",
          "hover:shadow-md hover:scale-[1.01]",
          "hover:border-primary/30 hover:bg-card/80",
          // Subtle gradient overlay on hover
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/0 before:to-primary/0",
          "hover:before:from-primary/5 hover:before:to-transparent before:transition-all before:duration-300",
          // Default provider highlighting
          provider.isDefault &&
            "ring-1 ring-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/0",
        )}
      >
        <CardHeader className="pb-[var(--spacing-component-md)] relative z-10">
          <div className="flex items-start gap-[var(--spacing-component-md)]">
            {/* Enhanced Provider Avatar with icon */}
            <div className="relative shrink-0">
              <Avatar className="size-12 ring-2 ring-primary/10 transition-all duration-200 group-hover:ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary border border-primary/20 text-lg">
                  {getProviderIcon(provider.type)}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator */}
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card transition-all duration-200",
                  provider.isActive && "bg-chart-2",
                  !provider.isActive && "bg-muted-foreground",
                )}
              />
              {/* Default provider crown */}
              {provider.isDefault && (
                <div className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center border-2 border-card">
                  <Star className="size-2.5 text-primary-foreground fill-current" />
                </div>
              )}
            </div>

            {/* Provider Info */}
            <div className="flex-1 min-w-0 space-y-[var(--spacing-component-xs)]">
              <div className="flex items-center gap-[var(--spacing-component-sm)]">
                <h3 className="text-lg font-semibold leading-tight truncate text-foreground group-hover:text-primary transition-colors duration-200">
                  {provider.name}
                </h3>
                {provider.isDefault && (
                  <Badge
                    variant="default"
                    className="text-xs shrink-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-sm"
                  >
                    <Check className="size-2.5 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-[var(--spacing-component-sm)] text-sm text-muted-foreground">
                <span className="font-medium">
                  {getProviderLabel(provider.type)}
                </span>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span className="truncate">{provider.defaultModel}</span>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative z-20 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "size-9 p-0 rounded-lg",
                      "opacity-0 group-hover:opacity-100 transition-all duration-200",
                      "hover:bg-accent/50",
                      "focus:opacity-100 focus:bg-accent/50",
                    )}
                    disabled={isLoading}
                    aria-label={`Actions for ${provider.name}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-card/95 backdrop-blur-sm border border-border/60 shadow-lg"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/user/settings/llm-providers/$providerId/edit"
                      params={{ providerId: provider.id }}
                      search={{}}
                      className="cursor-pointer focus:bg-accent/50 transition-colors"
                    >
                      <Edit2 className="mr-3 size-4 text-chart-3" />
                      <span className="font-medium">Edit Provider</span>
                    </Link>
                  </DropdownMenuItem>

                  {!provider.isDefault && (
                    <DropdownMenuItem
                      onClick={handleSetDefault}
                      className="focus:bg-accent/50 transition-colors"
                    >
                      <Star className="mr-3 size-4 text-chart-4" />
                      <span className="font-medium">Set as Default</span>
                    </DropdownMenuItem>
                  )}

                  {provider.isDefault && (
                    <DropdownMenuItem disabled className="opacity-60">
                      <StarOff className="mr-3 size-4 text-muted-foreground" />
                      <span className="font-medium">Current Default</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-border/50" />

                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="mr-3 size-4" />
                    <span className="font-medium">Delete Provider</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {/* Provider Details */}
        <CardContent className="pt-0 px-[var(--spacing-component-lg)] pb-[var(--spacing-component-lg)] relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[var(--spacing-component-sm)]">
              <div
                className={cn(
                  "flex items-center gap-[var(--spacing-component-sm)] px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] rounded-md border transition-colors",
                  provider.isActive
                    ? "bg-chart-2/10 border-chart-2/20 text-chart-2"
                    : "bg-muted/50 border-border/40 text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    provider.isActive ? "bg-chart-2" : "bg-muted-foreground",
                  )}
                />
                <span className="text-xs font-medium">
                  {provider.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Usage indicator */}
              <div className="flex items-center gap-[var(--spacing-component-xs)]">
                <div className="w-1 h-1 rounded-full bg-chart-1 opacity-60" />
                <div className="w-1 h-1 rounded-full bg-chart-1 opacity-40" />
                <div className="w-1 h-1 rounded-full bg-chart-1 opacity-20" />
              </div>
            </div>

            {provider.baseUrl && (
              <div className="text-xs text-muted-foreground font-medium bg-muted/30 px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] rounded-md">
                Custom Endpoint
              </div>
            )}
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
