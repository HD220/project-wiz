import { useNavigate } from "@tanstack/react-router";
import { Search, Check, MessageSquare } from "lucide-react";
import { AlertCircle } from "lucide-react";

import type { UserSummary } from "@/main/features/user/user.service";

import * as StandardFormModal from "@/renderer/components/form-modal";
import { Alert, AlertDescription } from "@/renderer/components/ui/alert";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { Input } from "@/renderer/components/ui/input";
import type { CreateConversationInput } from "@/renderer/features/conversation/types";
import type { AuthenticatedUser } from "@/main/features/user/user.types";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
} from "@/renderer/features/user/components/profile-avatar";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { loadApiData } from "@/renderer/lib/route-loader";
import { cn } from "@/renderer/lib/utils";
import { useUserSelection } from "@/renderer/features/user/hooks/use-user-selection.hook";

interface CreateConversationPageProps {
  availableUsers: UserSummary[];
  currentUser: AuthenticatedUser;
}

export function CreateConversationPage({
  availableUsers,
  currentUser,
}: CreateConversationPageProps) {
  const navigate = useNavigate();
  const {
    searchTerm,
    setSearchTerm,
    selectedUserIds,
    setSelectedUserIds,
    error,
    setError,
    filteredUsers,
    handleSearchChange,
    handleUserToggle,
    validateSelection,
    selectedCount,
  } = useUserSelection(availableUsers);

  // Mutation for creating conversation
  const createConversationMutation = useApiMutation(
    (data: CreateConversationInput) => window.api.dm.create(data),
    {
      successMessage: "Conversation created successfully",
      errorMessage: "Failed to create conversation",
      invalidateRouter: true,
      onSuccess: (response: { data?: { id?: string } }) => {
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

  function handleCreateConversation() {
    if (!validateSelection()) {
      return;
    }

    const participantIds = [currentUser.id, ...selectedUserIds];
    createConversationMutation.mutate({
      participantIds,
      description: undefined,
    });
  }

  const isLoading = createConversationMutation.isPending;

  // Correct masked route implementation - single modal only
  return (
    <StandardFormModal.StandardFormModal
      open
      onOpenChange={(open: boolean) => !open && handleClose()}
    >
      <StandardFormModal.StandardFormModalContent className="max-w-md">
        <StandardFormModal.StandardFormModalHeader
          title="Create DM"
          description={
            selectedCount > 0
              ? `${selectedCount} selected`
              : "Find or start a conversation"
          }
          icon={MessageSquare}
        />

        <StandardFormModal.StandardFormModalBody>
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
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleUserToggle(user.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
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
        </StandardFormModal.StandardFormModalBody>

        <StandardFormModal.StandardFormModalFooter>
          <StandardFormModal.StandardFormModalActions>
            <StandardFormModal.StandardFormModalCancelButton
              onCancel={handleClose}
              disabled={isLoading}
            >
              Cancel
            </StandardFormModal.StandardFormModalCancelButton>
            <StandardFormModal.StandardFormModalSubmitButton
              onClick={handleCreateConversation}
              isSubmitting={isLoading}
              loadingText="Creating..."
              disabled={selectedCount === 0}
            >
              {`Create${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
            </StandardFormModal.StandardFormModalSubmitButton>
          </StandardFormModal.StandardFormModalActions>
        </StandardFormModal.StandardFormModalFooter>
      </StandardFormModal.StandardFormModalContent>
    </StandardFormModal.StandardFormModal>
  );
}
