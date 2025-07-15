import { Link } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import type { ConversationDto } from '../../../../shared/types/domains/users/user.types';

interface ConversationListItemProps {
  conversation: ConversationDto;
  otherParticipant: string;
  formattedTime: string;
}

export function ConversationListItem({ conversation, otherParticipant, formattedTime }: ConversationListItemProps) {
  return (
    <Link
      key={conversation.id}
      to="/conversation/$conversationId"
      params={{ conversationId: conversation.id }}
      className="block w-full px-2 py-3 text-left rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
      activeProps={{
        className: "block w-full px-2 py-3 text-left rounded-md transition-colors bg-secondary text-secondary-foreground",
      }}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 mr-3 flex-shrink-0">
          <Avatar className="w-8 h-8">
            <AvatarImage src={`/avatars/${otherParticipant}.png`} />
            <AvatarFallback className="text-xs">
              {otherParticipant.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="truncate font-medium text-sm">
              {otherParticipant}
            </span>
            {conversation.lastMessageAt && (
              <span className="text-xs text-muted-foreground ml-2">
                {formattedTime}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            Mensagem direta
          </div>
        </div>
      </div>
    </Link>
  );
}