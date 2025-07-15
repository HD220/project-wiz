import { ScrollArea } from '../../../../components/ui/scroll-area';
import { useConversations } from '../hooks/use-conversations.hook';
import { useConversationUtils } from '../hooks/use-conversation-utils.hook';
import { ConversationListSkeleton } from './conversation-list-skeleton';
import { ConversationListItem } from './conversation-list-item';
import { ConversationListEmptyState } from './conversation-list-empty-state';

interface ConversationListProps {}

export function ConversationList({}: ConversationListProps) {
  const { conversations, isLoading } = useConversations({ participantId: "user" });
  const { getOtherParticipant, formatLastMessageTime } = useConversationUtils();

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => {
          const otherParticipant = getOtherParticipant(conversation);
          const formattedTime = formatLastMessageTime(conversation.lastMessageAt);

          return (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              otherParticipant={otherParticipant}
              formattedTime={formattedTime}
            />
          );
        })}

        {conversations.length === 0 && <ConversationListEmptyState />}
      </div>
    </ScrollArea>
  );
}