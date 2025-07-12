import { useState, useEffect } from "react";

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
}

function ConversationList({ onSelectConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const dummyConversations = ["user1-user2", "user3-user4", "user5-user6"];
      setConversations(dummyConversations);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Conversations</h2>
      <ul>
        {conversations.map((convId) => (
          <li
            key={convId}
            className="py-2 border-b border-gray-200 last:border-b-0"
          >
            <button
              onClick={() => onSelectConversation(convId)}
              className="text-blue-600 hover:underline"
            >
              {convId}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { ConversationList };
