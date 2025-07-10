import { useIpcQuery } from "@/renderer/hooks/use-ipc-query.hook";
import { useIpcMutation } from "@/renderer/hooks/use-ipc-mutation.hook";
import type { IForumTopic, IForumPost } from "@/shared/ipc-types/domain-types";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type {
  IpcForumCreatePostPayload,
  IpcForumCreateTopicPayload,
  IpcForumListPostsPayload,
  IpcForumListTopicsPayload,
} from "@/shared/ipc-types/ipc-payloads";

export function useForum() {
  const { data: topics, isLoading: loading, error, refetch: fetchTopics } = useIpcQuery<IForumTopic[], IpcForumListTopicsPayload>({
    channel: IpcChannel.FORUM_LIST_TOPICS,
  });

  const { mutate: createTopic } = useIpcMutation<IForumTopic, Error, IpcForumCreateTopicPayload>({
    channel: IpcChannel.FORUM_CREATE_TOPIC,
    onSuccess: () => {
      fetchTopics();
    },
  });

  const { mutate: createPost } = useIpcMutation<IForumPost, Error, IpcForumCreatePostPayload>({
    channel: IpcChannel.FORUM_CREATE_POST,
  });

  const { data: posts, isLoading: postsLoading, error: postsError, refetch: fetchPosts } = useIpcQuery<IForumPost[], IpcForumListPostsPayload>({
    channel: IpcChannel.FORUM_LIST_POSTS,
    enabled: false, // Will be enabled when topicId is available
  });

  const handleCreateTopic = async (title: string, authorId: string) => {
    createTopic({ title, authorId });
  };

  const handleCreatePost = async (topicId: string, authorId: string, content: string) => {
    createPost({ topicId, authorId, content });
  };

  const handleGetPostsForTopic = async (topicId: string): Promise<IForumPost[]> => {
    const result = await fetchPosts({ payload: { topicId } });
    return result.data || [];
  };

  return {
    topics,
    loading,
    error,
    createTopic: handleCreateTopic,
    createPost: handleCreatePost,
    getPostsForTopic: handleGetPostsForTopic,
  };
}
