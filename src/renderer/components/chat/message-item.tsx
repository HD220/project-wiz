import { MessageActions } from "./message-actions";
import { MessageAvatar } from "./message-avatar";
import { MessageContent } from "./message-content";
import { MessageEditForm } from "./message-edit-form";
import { MessageHeader } from "./message-header";
import { createMessageItemHandlers } from "./message-item-handlers";
import { useMessageItemState } from "./message-item-state.hook";
import { getMessageItemStyles } from "./message-item-styles";
import { MessageItemProps } from "./message-item-types";

export function MessageItem(props: MessageItemProps) {
  const { message, onEdit, onDelete, onReply, showActions = true } = props;
  const { showMenu, setShowMenu, isEditing, setIsEditing } =
    useMessageItemState();
  const { handleEditSave, handleEditCancel, handleEditStart } =
    createMessageItemHandlers(message.id, onEdit, setIsEditing);

  const containerClasses = getMessageItemStyles(message.mentions);

  return (
    <div
      className={containerClasses}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className="flex space-x-3">
        <MessageAvatar
          senderId={message.senderId}
          senderName={message.senderName}
          senderType={message.senderType}
        />
        <div className="flex-1 min-w-0">
          <MessageHeader
            senderName={message.senderName}
            senderType={message.senderType}
            messageType={message.messageType}
            timestamp={message.timestamp}
            isEdited={message.isEdited}
          />
          {isEditing ? (
            <MessageEditForm
              initialContent={message.content}
              onSave={handleEditSave}
              onCancel={handleEditCancel}
            />
          ) : (
            <MessageContent
              content={message.content}
              messageType={message.messageType}
              mentions={message.mentions}
            />
          )}
        </div>
      </div>
      {showMenu && showActions && (
        <MessageActions
          messageId={message.id}
          senderType={message.senderType}
          onEdit={handleEditStart}
          onDelete={onDelete}
          onReply={onReply}
        />
      )}
    </div>
  );
}
