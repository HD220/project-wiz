import React, { useEffect, useState } from "react";
import { useForum } from "@/renderer/hooks/use-forum";
import { IForumPost } from "@/shared/ipc-types/entities";

interface DiscussionThreadProps {
  topicId: string;
}

export function DiscussionThread({ topicId }: DiscussionThreadProps) {
  const { getPostsForTopic, loading, error } = useForum();
  const [posts, setPosts] = useState<IForumPost[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      if (topicId) {
        const fetchedPosts = await getPostsForTopic(topicId);
        setPosts(fetchedPosts);
      }
    };
    loadPosts();
  }, [topicId, getPostsForTopic]);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Discussion</h2>
      {posts.length === 0 ? (
        <p>No posts yet for this topic.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <strong>{post.authorId}:</strong> {post.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
