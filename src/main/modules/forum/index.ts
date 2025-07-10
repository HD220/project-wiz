import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { db } from "@/main/persistence/db";


import { ipcMain } from "electron";
import { DrizzleForumTopicRepository } from "./persistence/drizzle-forum-topic.repository";
import { DrizzleForumPostRepository } from "./persistence/drizzle-forum-post.repository";

import {
  CreateForumTopicCommandHandler,
  CreateForumTopicCommand,
} from "./application/commands/create-forum-topic.command";
import {
  ListForumTopicsQueryHandler,
  ListForumTopicsQuery,
} from "./application/queries/list-forum-topics.query";
import {
  UpdateForumTopicCommandHandler,
  UpdateForumTopicCommand,
} from "./application/commands/update-forum-topic.command";
import {
  RemoveForumTopicCommandHandler,
  RemoveForumTopicCommand,
} from "./application/commands/remove-forum-topic.command";
import {
  GetForumTopicQueryHandler,
  GetForumTopicQuery,
} from "./application/queries/get-forum-topic.query";

import {
  CreateForumPostCommandHandler,
  CreateForumPostCommand,
} from "./application/commands/create-forum-post.command";
import {
  ListForumPostsQueryHandler,
  ListForumPostsQuery,
} from "./application/queries/list-forum-posts.query";
import {
  UpdateForumPostCommandHandler,
  UpdateForumPostCommand,
} from "./application/commands/update-forum-post.command";
import {
  RemoveForumPostCommandHandler,
  RemoveForumPostCommand,
} from "./application/commands/remove-forum-post.command";
import {
  GetForumPostQueryHandler,
  GetForumPostQuery,
} from "./application/queries/get-forum-post.query";

import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { IForumTopic, IForumPost } from "@/shared/ipc-types/domain-types";
import {
  IpcForumListTopicsResponse,
  IpcForumCreateTopicPayload,
  IpcForumCreateTopicResponse,
  IpcForumListPostsPayload,
  IpcForumListPostsResponse,
  IpcForumCreatePostPayload,
  IpcForumCreatePostResponse,
} from "@/shared/ipc-types/ipc-payloads";

function registerForumTopicHandlers(
  cqrsDispatcher: CqrsDispatcher,
  forumTopicRepository: DrizzleForumTopicRepository,
) {
  const createForumTopicCommandHandler = new CreateForumTopicCommandHandler(
    forumTopicRepository,
  );
  const listForumTopicsQueryHandler = new ListForumTopicsQueryHandler(
    forumTopicRepository,
  );
  const updateForumTopicCommandHandler = new UpdateForumTopicCommandHandler(
    forumTopicRepository,
  );
  const removeForumTopicCommandHandler = new RemoveForumTopicCommandHandler(
    forumTopicRepository,
  );
  const getForumTopicQueryHandler = new GetForumTopicQueryHandler(
    forumTopicRepository,
  );

  cqrsDispatcher.registerCommandHandler(
    CreateForumTopicCommand.name,
    createForumTopicCommandHandler.handle.bind(createForumTopicCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler(
    ListForumTopicsQuery.name,
    listForumTopicsQueryHandler.handle.bind(listForumTopicsQueryHandler),
  );
  cqrsDispatcher.registerCommandHandler(
    UpdateForumTopicCommand.name,
    updateForumTopicCommandHandler.handle.bind(updateForumTopicCommandHandler),
  );
  cqrsDispatcher.registerCommandHandler(
    RemoveForumTopicCommand.name,
    removeForumTopicCommandHandler.handle.bind(removeForumTopicCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler(
    GetForumTopicQuery.name,
    getForumTopicQueryHandler.handle.bind(getForumTopicQueryHandler),
  );
}

function registerForumPostHandlers(
  cqrsDispatcher: CqrsDispatcher,
  forumPostRepository: DrizzleForumPostRepository,
) {
  const createForumPostCommandHandler = new CreateForumPostCommandHandler(
    forumPostRepository,
  );
  const listForumPostsQueryHandler = new ListForumPostsQueryHandler(
    forumPostRepository,
  );
  const updateForumPostCommandHandler = new UpdateForumPostCommandHandler(
    forumPostRepository,
  );
  const removeForumPostCommandHandler = new RemoveForumPostCommandHandler(
    forumPostRepository,
  );
  const getForumPostQueryHandler = new GetForumPostQueryHandler(
    forumPostRepository,
  );

  cqrsDispatcher.registerCommandHandler(
    CreateForumPostCommand.name,
    createForumPostCommandHandler.handle.bind(createForumPostCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler(
    ListForumPostsQuery.name,
    listForumPostsQueryHandler.handle.bind(listForumPostsQueryHandler),
  );
  cqrsDispatcher.registerCommandHandler(
    UpdateForumPostCommand.name,
    updateForumPostCommandHandler.handle.bind(updateForumPostCommandHandler),
  );
  cqrsDispatcher.registerCommandHandler(
    RemoveForumPostCommand.name,
    removeForumPostCommandHandler.handle.bind(removeForumPostCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler(
    GetForumPostQuery.name,
    getForumPostQueryHandler.handle.bind(getForumPostQueryHandler),
  );
}

function handleForumListTopics(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.FORUM_LIST_TOPICS,
    async (): Promise<IpcForumListTopicsResponse> => {
      try {
        const topics = (await cqrsDispatcher.dispatchQuery(
          new ListForumTopicsQuery(),
        )) as IForumTopic[];
        return { success: true, data: topics };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}

function handleForumCreateTopic(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.FORUM_CREATE_TOPIC,
    async (
      _,
      payload: IpcForumCreateTopicPayload,
    ): Promise<IpcForumCreateTopicResponse> => {
      try {
        const topic = (await cqrsDispatcher.dispatchCommand(
          new CreateForumTopicCommand(payload),
        )) as IForumTopic;
        return { success: true, data: topic };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}

function handleForumListPosts(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.FORUM_LIST_POSTS,
    async (
      _,
      payload: IpcForumListPostsPayload,
    ): Promise<IpcForumListPostsResponse> => {
      try {
        const posts = (await cqrsDispatcher.dispatchQuery(
          new ListForumPostsQuery(payload),
        )) as IForumPost[];
        return { success: true, data: posts };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}

function handleForumCreatePost(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.FORUM_CREATE_POST,
    async (
      _,
      payload: IpcForumCreatePostPayload,
    ): Promise<IpcForumCreatePostResponse> => {
      try {
        const post = (await cqrsDispatcher.dispatchCommand(
          new CreateForumPostCommand(payload),
        )) as IForumPost;
        return { success: true, data: post };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}



export function registerForumModule(
  cqrsDispatcher: CqrsDispatcher,
) {
  const forumTopicRepository = new DrizzleForumTopicRepository(db);
  const forumPostRepository = new DrizzleForumPostRepository(db);

  registerForumTopicHandlers(cqrsDispatcher, forumTopicRepository);
  registerForumPostHandlers(cqrsDispatcher, forumPostRepository);
  handleForumListTopics(cqrsDispatcher);
  handleForumCreateTopic(cqrsDispatcher);
  handleForumListPosts(cqrsDispatcher);
  handleForumCreatePost(cqrsDispatcher);
}
