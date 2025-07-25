import { useRouter } from "@tanstack/react-router";
import { Archive, ArchiveRestore, User } from "lucide-react";

import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/renderer/components/ui/tooltip";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { cn } from "@/renderer/lib/utils";

interface ArchivedConversationBannerProps {
  conversationId: string;
  conversationName?: string;
  archivedAt: Date;
  archivedBy: string | null;
  className?: string;
}

function ArchivedConversationBanner(props: ArchivedConversationBannerProps) {
  const {
    conversationId,
    conversationName,
    archivedAt,
    archivedBy,
    className,
  } = props;
  const router = useRouter();

  // Unarchive mutation with automatic error handling
  const unarchiveMutation = useApiMutation(
    (conversationId: string) =>
      window.api.conversations.unarchive(conversationId),
    {
      successMessage: "Conversa desarquivada com sucesso",
      onSuccess: () => {
        // Invalidate routes to refresh conversation lists
        router.invalidate();
      },
    },
  );

  function handleUnarchive() {
    unarchiveMutation.mutate(conversationId);
  }

  // Format archived date - simples pt-BR format
  const formatArchivedDate = () => {
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(archivedAt));
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <div
      className={cn(
        "border-b border-orange-200 bg-orange-50/50 px-4 py-3",
        "dark:border-orange-800/30 dark:bg-orange-950/20",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Archive info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Archive className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Esta conversa foi arquivada
              </p>
              <Badge
                variant="secondary"
                className="h-5 px-2 text-xs bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800"
              >
                Arquivada
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-orange-700 dark:text-orange-300">
              <span>em {formatArchivedDate()}</span>

              {archivedBy && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <User className="h-3 w-3" />
                        <span>por usuário</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ID do usuário: {archivedBy}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Unarchive button */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnarchive}
            disabled={unarchiveMutation.isPending}
            className="border-orange-300 hover:bg-orange-100 hover:border-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/20"
          >
            {unarchiveMutation.isPending ? (
              <>
                <ArchiveRestore className="h-4 w-4 mr-2 animate-pulse" />
                Desarquivando...
              </>
            ) : (
              <>
                <ArchiveRestore className="h-4 w-4 mr-2" />
                Desarquivar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { ArchivedConversationBanner };
