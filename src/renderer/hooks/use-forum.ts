import { useEffect, useState, useCallback } from "react";
import { IForumTopic, IForumPost } from "@/shared/ipc-types/domain-types";
import { ElectronIPC } from "../preload";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";

declare global {
  interface Window {
    electronIPC: ElectronIPC;
  }
}

// Helper function to load topics
async function loadTopicsHelper(
  setTopics: (topics: IForumTopic[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
) {
  setLoading(true);
  try {
    const result = await window.electronIPC.invoke(
      IpcChannel.FORUM_LIST_TOPICS,
    );
    if (result.success && result.data) {
      setTopics(result.data);
    } else {
      setError(result.error?.message || "An unknown error occurred");
    }
  } catch (err: unknown) {
    setError((err as Error).message);
  } finally {
    setLoading(false);
  }
}

export function useForum() {
  const [topics, setTopics] = useState<IForumTopic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTopicsHelper(setTopics, setLoading, setError);
  }, []);

  const handleCreateTopic = useCallback(
    async (title: string, authorId: string) => {
      setLoading(true);
      try {
        const result = await window.electronIPC.invoke(
          IpcChannel.FORUM_CREATE_TOPIC,
          {
            title,
            authorId,
          },
        );
        if (result.success && result.data) {
          const updatedTopicsResult = await window.electronIPC.invoke(
            IpcChannel.FORUM_LIST_TOPICS,
          );
          if (updatedTopicsResult.success && updatedTopicsResult.data) {
            setTopics(updatedTopicsResult.data);
          } else {
            setError(
              updatedTopicsResult.error?.message || "An unknown error occurred",
            );
          }
        } else {
          setError(result.error?.message || "An unknown error occurred");
        }
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleCreatePost = useCallback(
    async (topicId: string, authorId: string, content: string) => {
      setLoading(true);
      try {
        const result = await window.electronIPC.invoke(
          IpcChannel.FORUM_CREATE_POST,
          {
            topicId,
            authorId,
            content,
          },
        );
        if (result.success) {
          // No need to reload all posts here, as getPostsForTopic will fetch them dynamically
        } else {
          setError(result.error?.message || "An unknown error occurred");
        }
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleGetPostsForTopic = useCallback(
    async (topicId: string): Promise<IForumPost[]> => {
      setLoading(true);
      try {
        const result = await window.electronIPC.invoke(
          IpcChannel.FORUM_LIST_POSTS,
          {
            topicId,
          },
        );
        if (result.success && result.data) {
          return result.data;
        }
        setError(result.error?.message || "An unknown error occurred");
        return [];
      } catch (err: unknown) {
        setError((err as Error).message);
        return [];
      }
    },
    [],
  );

  // TODO: Add functions for update and remove operations for topics and posts

  return {
    topics,
    loading,
    error,
    createTopic: handleCreateTopic,
    createPost: handleCreatePost,
    getPostsForTopic: handleGetPostsForTopic,
  };
}
