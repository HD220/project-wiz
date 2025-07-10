import { useEffect, useState, useCallback } from "react";
import { IForumTopic, IForumPost } from "@/shared/ipc-types/domain-types";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import {
  IpcForumCreatePostPayload,
  IpcForumCreateTopicPayload,
} from "@/shared/ipc-types/ipc-payloads";

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

async function createTopicHelper(
  payload: IpcForumCreateTopicPayload,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
) {
  setLoading(true);
  try {
    const result = await window.electronIPC.invoke(
      IpcChannel.FORUM_CREATE_TOPIC,
      payload,
    );
    if (!result.success) {
      setError(result.error?.message || "An unknown error occurred");
    }
    return result.success;
  } catch (err: unknown) {
    setError((err as Error).message);
    return false;
  } finally {
    setLoading(false);
  }
}

async function createPostHelper(
  payload: IpcForumCreatePostPayload,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
) {
  setLoading(true);
  try {
    const result = await window.electronIPC.invoke(
      IpcChannel.FORUM_CREATE_POST,
      payload,
    );
    if (!result.success) {
      setError(result.error?.message || "An unknown error occurred");
    }
    return result.success;
  } catch (err: unknown) {
    setError((err as Error).message);
    return false;
  } finally {
    setLoading(false);
  }
}

async function getPostsForTopicHelper(
  topicId: string,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
): Promise<IForumPost[]> {
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
      const success = await createTopicHelper(
        { title, authorId },
        setLoading,
        setError,
      );
      if (success) {
        loadTopicsHelper(setTopics, setLoading, setError);
      }
    },
    [],
  );

  const handleCreatePost = useCallback(
    async (topicId: string, authorId: string, content: string) => {
      await createPostHelper(
        { topicId, authorId, content },
        setLoading,
        setError,
      );
    },
    [],
  );

  const handleGetPostsForTopic = useCallback(
    async (topicId: string): Promise<IForumPost[]> => {
      return getPostsForTopicHelper(topicId, setLoading, setError);
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
