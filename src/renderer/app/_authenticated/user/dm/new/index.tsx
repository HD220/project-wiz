import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, Check, MessageSquare } from "lucide-react";
import { useState } from "react";

import type { UserSummary } from "@/main/features/user/user.service";

import {
  StandardFormModal,
  StandardFormModalContent,
  StandardFormModalHeader,
  StandardFormModalBody,
  StandardFormModalFooter,
  StandardFormModalActions,
  StandardFormModalCancelButton,
  StandardFormModalSubmitButton,
} from "@/renderer/components/form-modal";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
} from "@/renderer/components/profile-avatar";
import { Input } from "@/renderer/components/ui/input";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { Alert, AlertDescription } from "@/renderer/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { CreateConversationInput } from "@/renderer/features/conversation/types";
import type { AuthenticatedUser } from "@/renderer/features/conversation/types";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { loadApiData } from "@/renderer/lib/route-loader";
import { cn } from "@/renderer/lib/utils";

function CreateConversationPage() {
  const navigate = useNavigate();
  const availableUsers = Route.useLoaderData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get current user - this should be available from auth context
  // For now using a placeholder - in real app would come from useAuth()
  const currentUser: AuthenticatedUser = {
    id: "current-user-id", // This should come from auth context
    name: "Current User",
    type: "human",
    avatar: null,
    isActive: true,
    deactivatedAt: null,
    deactivatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mutation for creating conversation
  const createConversationMutation = useApiMutation(
    (data: CreateConversationInput) => window.api.dm.create(data),
    {
      successMessage: "Conversation created successfully",
      errorMessage: "Failed to create conversation",
      invalidateRouter: false,
      onSuccess: (response: any) => {
        if (response?.data?.id) {
          handleSuccess(response.data.id);
        }
      },
    },
  );

  function handleSuccess(conversationId: string) {
    // Navigate to the new conversation
    navigate({
      to: "/user/dm/$conversationId",
      params: { conversationId },
    });
  }

  function handleClose() {
    // Navigate back to user page
    navigate({ to: "/user" });
  }

  // Filter users based on search
  const filteredUsers = (availableUsers as UserSummary[]).filter(
    (user: UserSummary) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function handleSearchChange(value: string) {
    // Basic validation: limit search term length
    if (value.length <= 100) {
      setSearchTerm(value);
      setError(null); // Clear error when user types
    }
  }

  function handleUserToggle(userId: string) {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
    setError(null); // Clear error when user selects
  }

  function handleCreateConversation() {
    // Basic validation: ensure users are selected
    if (selectedUserIds.length === 0) {
      setError("Please select at least one user to start a conversation");
      return;
    }

    // Basic validation: ensure search term is reasonable if provided
    if (searchTerm.trim().length > 100) {
      setError("Search term is too long");
      return;
    }

    setError(null);
    const participantIds = [currentUser.id, ...selectedUserIds];
    createConversationMutation.mutate({
      participantIds,
      description: undefined,
    });
  }

  const selectedCount = selectedUserIds.length;
  const isLoading = createConversationMutation.isPending;

  // Correct masked route implementation - single modal only
  return (
    <StandardFormModal
      open
      onOpenChange={(open: boolean) => !open && handleClose()}
    >
      <StandardFormModalContent className="max-w-md">
        <StandardFormModalHeader
          title="Create DM"
          description={
            selectedCount > 0
              ? `${selectedCount} selected`
              : "Find or start a conversation"
          }
          icon={MessageSquare}
        />

        <StandardFormModalBody>
          {/* Search input */}
          <div className="mb-4 px-[2px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find or start a conversation"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-9 bg-muted/30 border-0 focus:bg-background focus-visible:ring-1 focus-visible:ring-ring"
                maxLength={100}
                autoFocus
              />
            </div>
          </div>

          {/* User list */}
          {filteredUsers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user: UserSummary) => {
                const isSelected = selectedUserIds.includes(user.id);

                return (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                      "hover:bg-muted/50",
                      isSelected && "bg-primary/10",
                    )}
                    onClick={() => handleUserToggle(user.id)}
                  >
                    {/* Checkbox */}
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked !== isSelected) {
                          handleUserToggle(user.id);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />

                    {/* Avatar */}
                    <div className="relative">
                      <ProfileAvatar size="sm">
                        <ProfileAvatarImage
                          src={user.avatar}
                          name={user.name}
                          size="sm"
                          className="ring-1 ring-border/50 transition-all duration-200 hover:ring-primary/30 hover:scale-[1.02]"
                        />
                        <ProfileAvatarStatus id={user.id} size="sm" />
                      </ProfileAvatar>
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.type === "agent" ? "AI Agent" : "User"}
                      </p>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </StandardFormModalBody>

        <StandardFormModalFooter>
          <StandardFormModalActions>
            <StandardFormModalCancelButton
              onCancel={handleClose}
              disabled={isLoading}
            >
              Cancel
            </StandardFormModalCancelButton>
            <StandardFormModalSubmitButton
              onClick={handleCreateConversation}
              isSubmitting={isLoading}
              loadingText="Creating..."
              disabled={selectedCount === 0}
            >
              {`Create${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
            </StandardFormModalSubmitButton>
          </StandardFormModalActions>
        </StandardFormModalFooter>
      </StandardFormModalContent>
    </StandardFormModal>
  );
}

export const Route = createFileRoute("/_authenticated/user/dm/new/")({
  loader: async () => {
    // Load available users for conversation creation
    const users = await loadApiData(
      () => window.api.users.listAvailableUsers(),
      "Failed to load users",
    );
    return users;
  },
  component: CreateConversationPage,
});
