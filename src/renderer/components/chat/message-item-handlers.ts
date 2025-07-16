export function createMessageItemHandlers(
  messageId: string,
  onEdit: (messageId: string, content: string) => void,
  setIsEditing: (editing: boolean) => void,
) {
  return {
    handleEditSave: (content: string) => {
      onEdit(messageId, content);
      setIsEditing(false);
    },
    handleEditCancel: () => {
      setIsEditing(false);
    },
    handleEditStart: () => {
      setIsEditing(true);
    },
  };
}
