import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { X, Search, Plus, User, Bot } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { UserSummary } from "@/main/features/user/user.service";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { Input } from "@/renderer/components/ui/input";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import type { CreateConversationInput } from "@/renderer/features/conversation/types";
import type { AuthenticatedUser } from "@/renderer/features/conversation/types";

interface CreateConversationDialogProps {
  availableUsers: UserSummary[];
  currentUser: AuthenticatedUser;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

function CreateConversationDialog(props: CreateConversationDialogProps) {
  const { availableUsers, currentUser, onClose, onConversationCreated } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const router = useRouter();

  // PREFERRED: Direct mutation with window.api and route invalidation
  const createConversationMutation = useMutation({
    mutationFn: (data: CreateConversationInput) =>
      window.api.conversations.create(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success("Conversation created successfully");
        router.invalidate(); // Refresh route data (conversations + agents)
        onConversationCreated(response.data.id);
      }
    },
    onError: () => {
      toast.error("Failed to create conversation");
    },
  });

  // Filter agents based on search
  const filteredUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function handleUserToggle(userId: string) {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  function handleCreateConversation() {
    if (selectedUserIds.length === 0) return;

    // Include current user as participant
    const participantIds = [currentUser.id, ...selectedUserIds];

    createConversationMutation.mutate({
      participantIds,
      name: null,
      type: "dm" as const,
    });
  }

  const getSelectedUsers = () => {
    return availableUsers.filter((user) => selectedUserIds.includes(user.id));
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected users */}
          {selectedUserIds.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Selected ({selectedUserIds.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {getSelectedUsers().map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    <span className="text-xs">{user.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleUserToggle(user.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* User list */}
          <ScrollArea className="h-64 border rounded-md">
            <div className="space-y-1 p-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);

                  return (
                    <div
                      key={user.id}
                      role="button"
                      tabIndex={0}
                      className={`
                        flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors
                        hover:bg-muted/50
                        ${isSelected ? "bg-muted" : ""}
                      `}
                      onClick={() => handleUserToggle(user.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleUserToggle(user.id);
                        }
                      }}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Type indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-background rounded-full flex items-center justify-center border border-border">
                          {user.type === "agent" ? (
                            <Bot className="h-2.5 w-2.5 text-primary" />
                          ) : (
                            <User className="h-2.5 w-2.5 text-green-500" />
                          )}
                        </div>
                      </div>

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.type === "agent" ? "AI Agent" : "User"}
                        </p>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Plus className="h-2.5 w-2.5 text-primary-foreground rotate-45" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createConversationMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={
                selectedUserIds.length === 0 ||
                createConversationMutation.isPending
              }
            >
              {createConversationMutation.isPending
                ? "Creating..."
                : `Create Conversation (${selectedUserIds.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CreateConversationDialog };
