import { Search, Check, User, Bot } from "lucide-react";
import { useState } from "react";

import type { UserSummary } from "@/main/features/user/user.service";

import { Button } from "@/renderer/components/ui/button";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
} from "@/renderer/components/ui/profile-avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { Input } from "@/renderer/components/ui/input";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import type { CreateConversationInput } from "@/renderer/features/conversation/types";
import type { AuthenticatedUser } from "@/renderer/features/conversation/types";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { cn } from "@/renderer/lib/utils";

interface CreateConversationDialogProps {
  availableUsers: UserSummary[];
  currentUser: AuthenticatedUser;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export function CreateConversationDialog(props: CreateConversationDialogProps) {
  const { availableUsers, currentUser, onClose, onConversationCreated } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Mutation for creating conversation
  const createConversationMutation = useApiMutation(
    (data: CreateConversationInput) => window.api.conversations.create(data),
    {
      successMessage: "Conversation created successfully",
      errorMessage: "Failed to create conversation",
      invalidateRouter: false,
      onSuccess: (conversation) => {
        if (conversation?.id) {
          onConversationCreated(conversation.id);
        }
      },
    },
  );

  // Filter users based on search
  const filteredUsers = availableUsers.filter((user) =>
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
      name: null,
      type: "dm" as const,
    });
  }

  const selectedCount = selectedUserIds.length;
  const isLoading = createConversationMutation.isPending;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-border/80">
        {/* Compact header */}
        <DialogHeader className="px-[var(--spacing-component-sm)] py-[var(--spacing-component-sm)] border-b border-border/50">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            Create DM
            {selectedCount > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {selectedCount} selected
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="px-[var(--spacing-component-sm)] py-[var(--spacing-component-sm)] border-b border-border/50">
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
        <ScrollArea className="h-80">
          <div className="p-[var(--spacing-component-sm)]">
            {filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <div className="space-y-[var(--spacing-component-xs)]">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);

                  return (
                    <div
                      key={user.id}
                      className={cn(
                        "flex items-center gap-[var(--spacing-component-sm)] px-[var(--spacing-component-sm)] py-[var(--spacing-component-sm)] rounded-md cursor-pointer transition-colors",
                        "hover:bg-muted/50",
                        isSelected && "bg-primary/10",
                      )}
                      onClick={() => handleUserToggle(user.id)}
                    >
                      {/* Checkbox */}
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleUserToggle(user.id)}
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
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="px-[var(--spacing-component-sm)] py-[var(--spacing-component-sm)] border-t border-border/50">
          {/* Error message */}
          {error && (
            <div className="mb-3 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-[var(--spacing-component-sm)]">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateConversation}
              disabled={selectedCount === 0 || isLoading}
              className="min-w-20"
            >
              {isLoading
                ? "Creating..."
                : `Create${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
