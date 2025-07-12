import React from "react";
import { useForum } from "@/renderer/hooks/use-forum";

export function TopicList() {
  const { topics, loading, error } = useForum();

  if (loading) {
    return <div>Loading topics...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Topics</h2>
      {topics?.length === 0 ? (
        <p>No topics available.</p>
      ) : (
        <ul>
          {topics?.map((topic) => (
            <li key={topic.id}>{topic.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
