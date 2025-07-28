import { useRouter } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Calendar, Clock } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { cn } from "@/renderer/lib/utils";

interface ArchivedConversationBannerProps {
  conversationId: string;
  conversationName?: string;
  archivedAt: Date;
  className?: string;
}

export function ArchivedConversationBanner(
  props: ArchivedConversationBannerProps,
) {
  const { conversationId, archivedAt, className } = props;
  const router = useRouter();

  // Unarchive mutation with automatic error handling
  const unarchiveMutation = useApiMutation(
    (conversationId: string) =>
      window.api.conversations.unarchive(conversationId),
    {
      successMessage: "Conversation unarchived successfully",
      onSuccess: () => {
        // Invalidate routes to refresh conversation lists
        router.invalidate();
      },
    },
  );

  function handleUnarchive() {
    unarchiveMutation.mutate(conversationId);
  }

  // Format archived date - enhanced EN format with relative time
  const formatArchivedDate = () => {
    try {
      const archivedDate = new Date(archivedAt);
      const now = new Date();
      const diffInDays = Math.floor(
        (now.getTime() - archivedDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffInDays === 0) {
        return `today at ${new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(archivedDate)}`;
      } else if (diffInDays === 1) {
        return "yesterday";
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else {
        return new Intl.DateTimeFormat("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(archivedDate);
      }
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div
      className={cn(
        "border-b bg-gradient-to-r from-amber-50 to-orange-50/80 px-6 py-4 shadow-sm",
        "dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800/30",
        "border-amber-200/60 dark:border-amber-800/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Left side: Archive info with enhanced styling */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 flex items-center justify-center ring-2 ring-amber-200/50 dark:ring-amber-800/30 shadow-sm">
              <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-amber-900 dark:text-amber-100">
                This conversation has been archived
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm text-amber-700 dark:text-amber-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">{formatArchivedDate()}</span>
              </div>
              <div className="w-1 h-1 bg-amber-500 rounded-full" />
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>No notifications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Enhanced unarchive button */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnarchive}
            disabled={unarchiveMutation.isPending}
            className={cn(
              "border-amber-300 hover:bg-amber-100 hover:border-amber-400 text-amber-700",
              "dark:border-amber-700 dark:hover:bg-amber-900/20 dark:text-amber-300",
              "shadow-sm hover:shadow-md transition-all duration-200 min-w-[140px]",
              "font-medium",
            )}
          >
            {unarchiveMutation.isPending ? (
              <>
                <ArchiveRestore className="h-4 w-4 mr-2 animate-pulse" />
                Unarchiving...
              </>
            ) : (
              <>
                <ArchiveRestore className="h-4 w-4 mr-2" />
                Unarchive
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
