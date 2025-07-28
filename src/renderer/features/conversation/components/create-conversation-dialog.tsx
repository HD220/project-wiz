import { X, Search, Plus, User, Bot, MessageCircle, Users } from "lucide-react";
import { useState } from "react";

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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { Input } from "@/renderer/components/ui/input";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import type { CreateConversationInput } from "@/renderer/features/conversation/types";
import type { AuthenticatedUser } from "@/renderer/features/conversation/types";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { isValidAvatarUrl, cn } from "@/renderer/lib/utils";

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

  // Standardized mutation with automatic error handling
  const createConversationMutation = useApiMutation(
    (data: CreateConversationInput) => window.api.conversations.create(data),
    {
      successMessage: "Conversation created successfully",
      errorMessage: "Failed to create conversation",
      invalidateRouter: false, // Disable automatic invalidation to prevent double invalidation
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
      <DialogContent className="sm:max-w-lg border-border/50 shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center ring-2 ring-primary/20">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-left">
                Start New Conversation
              </DialogTitle>
            </div>
          </div>

          <DialogDescription className="text-left text-base leading-relaxed">
            Select users to start a new conversation with. Search for users and
            click to add them to the conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users and agents..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10 h-11 border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Enhanced selected users section */}
          {selectedUserIds.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  Selected ({selectedUserIds.length}):
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {getSelectedUsers().map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="gap-2 pr-1 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {user.type === "agent" ? (
                        <Bot className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      <span className="text-xs font-medium">{user.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors"
                      onClick={() => handleUserToggle(user.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced user list */}
          <ScrollArea className="h-72 border border-border/50 rounded-lg bg-muted/20">
            <div className="space-y-1 p-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No users found</p>
                  <p className="text-xs mt-1">Try adjusting your search term</p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);

                  return (
                    <div
                      key={user.id}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                        "hover:bg-card hover:shadow-sm hover:scale-[1.01] border",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                        isSelected
                          ? "bg-primary/10 border-primary/30 shadow-sm ring-2 ring-primary/20"
                          : "bg-background border-border/50 hover:border-border",
                      )}
                      onClick={() => handleUserToggle(user.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleUserToggle(user.id);
                        }
                      }}
                    >
                      {/* Enhanced avatar */}
                      <div className="relative flex-shrink-0">
                        <Avatar className="size-10 ring-2 ring-background shadow-sm transition-all duration-200 group-hover:shadow-md">
                          <AvatarImage
                            src={isValidAvatarUrl(user.avatar) || undefined}
                          />
                          <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/10 to-primary/20 text-foreground border border-border/50">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Enhanced type indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-background rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                          {user.type === "agent" ? (
                            <Bot className="h-2.5 w-2.5 text-primary" />
                          ) : (
                            <User className="h-2.5 w-2.5 text-emerald-500" />
                          )}
                        </div>
                      </div>

                      {/* Enhanced user info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate font-medium">
                          {user.type === "agent" ? "AI Agent" : "User"}
                        </p>
                      </div>

                      {/* Enhanced selection indicator */}
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                            <Plus className="h-3 w-3 text-primary-foreground rotate-45" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-border rounded-full group-hover:border-primary/50 transition-colors" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Enhanced actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createConversationMutation.isPending}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={
                selectedUserIds.length === 0 ||
                createConversationMutation.isPending
              }
              className={cn(
                "min-w-[160px] shadow-md hover:shadow-lg transition-all duration-200",
                "bg-primary hover:bg-primary/90",
              )}
            >
              {createConversationMutation.isPending ? (
                <>
                  <MessageCircle className="h-4 w-4 mr-2 animate-pulse" />
                  Creating...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Create ({selectedUserIds.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
