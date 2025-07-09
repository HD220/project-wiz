import React, { useState, useEffect, useCallback } from 'react';

import { IDirectMessage } from '@/shared/ipc-types/entities';



interface ChatWindowProps {
  conversationId: string;
}

function ChatWindow({ conversationId }: ChatWindowProps) {
  const [messages, setMessages] = useState<IDirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [senderId, receiverId] = conversationId.split('-');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronIPC.invoke('direct-messages:list', { senderId, receiverId });
      if (result.success) {
        setMessages(result.data || []);
      } else {
        setError(result.error?.message || 'An unknown error occurred');
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [senderId, receiverId]);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim()) {
      return;
    }

    try {
      const result = await window.electronIPC.invoke('direct-messages:send', {
        senderId,
        receiverId,
        content: newMessage,
      });
      if (result.success) {
        setNewMessage('');
        fetchMessages();
      } else {
        alert(`Error sending message: ${result.error?.message || 'An unknown error occurred'}`);
      }
    } catch (err: unknown) {
      alert(`Error sending message: ${(err as Error).message}`);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId, fetchMessages]);

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto mb-4 border rounded p-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2 ${msg.senderId === senderId ? 'text-right' : 'text-left'}`}>
            <span className="font-bold">{msg.senderId}: </span>{msg.content}
          </div>
        ))}
      </div>
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
    </div>
  );
}

export { ChatWindow };
