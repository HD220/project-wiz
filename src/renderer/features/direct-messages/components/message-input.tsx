import React from "react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (event: React.FormEvent) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
}) => {
  return (
    <form onSubmit={handleSendMessage} className="flex">
      <input
        type="text"
        value={newMessage}
        onChange={(changeEvent) => setNewMessage(changeEvent.target.value)}
        placeholder="Type a message..."
        className="flex-1 border rounded-l p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
