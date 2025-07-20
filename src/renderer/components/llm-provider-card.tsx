import {
  Star,
  Link,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import { useState } from "react";

import { useAuthStore } from "@/renderer/store/auth-store";
import { useLlmProviderStore } from "@/renderer/store/llm-provider-store";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LlmProvider {
  id: string;
  userId: string;
  name: string;
  type: "openai" | "deepseek" | "anthropic";
  apiKey: string;
  baseUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LlmProviderCardProps {
  provider: LlmProvider;
  onEdit?: (provider: LlmProvider) => void;
}

export function LlmProviderCard({ provider, onEdit }: LlmProviderCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuthStore();
  const { deleteProvider, setAsDefault, updateProvider, isLoading } =
    useLlmProviderStore();

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteProvider(provider.id);
      setShowDeleteDialog(false);
    } catch (_error) {
      // Error is handled by the store
    }
  };

  const handleSetAsDefault = async () => {
    if (!user || provider.isDefault) return;

    try {
      await setAsDefault(provider.id, user.id);
    } catch (_error) {
      // Error is handled by the store
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;

    try {
      await updateProvider(provider.id, {
        userId: user.id,
        name: provider.name,
        type: provider.type,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl,
        isDefault: provider.isDefault,
        isActive: !provider.isActive,
      });
    } catch (_error) {
      // Error is handled by the store
    }
  };

  return (
    <>
      <Card
        className={`transition-colors ${provider.isDefault ? "border-primary bg-primary/5" : ""}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{provider.name}</CardTitle>
              {provider.isDefault && (
                <Star className="h-4 w-4 fill-primary text-primary" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={provider.isActive ? "default" : "secondary"}>
                {provider.type}
              </Badge>
              {provider.isActive ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onEdit?.(provider)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>

                  {!provider.isDefault && (
                    <DropdownMenuItem
                      onClick={handleSetAsDefault}
                      disabled={isLoading}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Set as Default
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={handleToggleActive}
                    disabled={isLoading}
                  >
                    {provider.isActive ? (
                      <>
                        <PowerOff className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isLoading || provider.isDefault}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription>
            {provider.isDefault && "Default Provider"}
            {!provider.isDefault && provider.isActive && "Available"}
            {!provider.isActive && "Inactive"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>API Key:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                ••••••••
              </code>
            </div>
            {provider.baseUrl && (
              <div className="flex items-center gap-2">
                <Link className="h-3 w-3" />
                <span>Custom endpoint configured</span>
              </div>
            )}
            <div className="text-xs pt-2">
              Created: {new Date(provider.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{provider.name}&quot;? This action
              cannot be undone.
              {provider.isDefault && " You cannot delete the default provider."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={provider.isDefault}
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
