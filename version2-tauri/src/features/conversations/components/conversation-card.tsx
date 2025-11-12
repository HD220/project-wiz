import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/lib/types';

type ConversationCardProps = {
  conversation: Conversation;
  onSelect?: (conversation: Conversation) => void;
  onEdit?: (conversation: Conversation) => void;
  onArchive?: (conversation: Conversation) => void;
  onDelete?: (conversation: Conversation) => void;
  isSelected?: boolean;
};

export function ConversationCard({
  conversation,
  onSelect,
  onEdit,
  onArchive,
  onDelete,
  isSelected = false,
}: ConversationCardProps) {
  const isArchived = conversation.archived_at !== null;
  const isChannel = conversation.conversation_type === 'channel';

  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${isArchived ? 'opacity-60' : ''}`}
      onClick={() => onSelect?.(conversation)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                {isChannel ? '#' : ''}
                {conversation.name || 'Unnamed Conversation'}
              </CardTitle>
              {isArchived && <Badge variant="secondary">Archived</Badge>}
            </div>
            {conversation.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {conversation.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {isChannel ? 'Channel' : 'Direct Message'}
          </Badge>
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          {!isArchived && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(conversation);
              }}
            >
              Edit
            </Button>
          )}
          {!isArchived && onArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(conversation);
              }}
            >
              Archive
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation);
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
