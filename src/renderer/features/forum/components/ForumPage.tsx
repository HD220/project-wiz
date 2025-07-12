import React from "react";
import { TopicList } from "./TopicList";
import { DiscussionThread } from "./DiscussionThread";
import { useForum } from "@/renderer/hooks/use-forum";

export function ForumPage() {
  const { topics, loading, error } = useForum();

  if (loading) {
    return <div>Loading forum...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const selectedTopicId = topics!.length > 0 ? topics![0].id : undefined;

  return (
    <div>
      <h1>Forum</h1>
      <TopicList />
      {selectedTopicId && <DiscussionThread topicId={selectedTopicId} />}
    </div>
  );
}
