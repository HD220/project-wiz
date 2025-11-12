import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Message } from '@/lib/types';

type MessageBubbleProps = {
  message: Message;
  isCurrentUser: boolean;
  authorName: string;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
};

export function MessageBubble({
  message,
  isCurrentUser,
  authorName,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const formattedDate = new Date(message.created_at).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium">
            {authorName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium">{authorName}</span>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
          {message.edited_at && (
            <span className="text-xs text-muted-foreground italic">
              (edited)
            </span>
          )}
        </div>

        <Card
          className={`${
            isCurrentUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <CardContent className="p-3">
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>

            {(onEdit || onDelete) && isCurrentUser && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-current/20">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onEdit(message)}
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onDelete(message)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
