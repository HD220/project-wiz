import { useEffect, useState } from 'react';
import { IForumTopic, IForumPost } from '@/shared/ipc-types/entities';
import { ElectronIPC } from '../preload';

declare global {
  interface Window {
    electronIPC: ElectronIPC;
  }
}

// Helper function to load topics
async function loadTopicsHelper(setTopics: (topics: IForumTopic[]) => void, setLoading: (loading: boolean) => void, setError: (error: string | null) => void) {
  setLoading(true);
  try {
    const result = await window.electronIPC.invoke('forum:list-topics');
    if (result.success && result.data) {
      setTopics(result.data);
    } else {
      setError(result.error?.message || 'An unknown error occurred');
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

  const createTopic = async (title: string, authorId: string) => {
    setLoading(true);
    try {
      const result = await window.electronIPC.invoke('forum:create-topic', { title, authorId });
      if (result.success && result.data) {
        const updatedTopicsResult = await window.electronIPC.invoke('forum:list-topics');
        if (updatedTopicsResult.success && updatedTopicsResult.data) {
          setTopics(updatedTopicsResult.data);
        } else {
          setError(updatedTopicsResult.error?.message || 'An unknown error occurred');
        }
      } else {
        setError(result.error?.message || 'An unknown error occurred');
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const createPost = async (topicId: string, authorId: string, content: string) => {
    setLoading(true);
    try {
      const result = await window.electronIPC.invoke('forum:create-post', { topicId, authorId, content });
      if (result.success) {
        // No need to reload all posts here, as getPostsForTopic will fetch them dynamically
      } else {
        setError(result.error?.message || 'An unknown error occurred');
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const getPostsForTopic = async (topicId: string): Promise<IForumPost[]> => {
    setLoading(true);
    try {
      const result = await window.electronIPC.invoke('forum:list-posts', { topicId });
      if (result.success && result.data) {
        return result.data;
      } 
        setError(result.error?.message || 'An unknown error occurred');
        return [];
      
    } catch (err: unknown) {
      setError((err as Error).message);
      return [];
    }
  };

  // TODO: Add functions for update and remove operations for topics and posts

  return {
    topics,
    loading,
    error,
    createTopic,
    createPost,
    getPostsForTopic,
  };
}
