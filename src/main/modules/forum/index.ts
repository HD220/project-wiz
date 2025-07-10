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
  createIpcHandler<IpcForumListTopicsPayload, IForumTopic[]>(
    IpcChannel.FORUM_LIST_TOPICS,
    cqrsDispatcher,
    async (payload) => {
      const topics = (await cqrsDispatcher.dispatchQuery(
        new ListForumTopicsQuery(payload),
      )) as IForumTopic[];
      return topics;
    },
  );
}

import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";
import type { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type { IForumTopic, IForumPost } from "@/shared/ipc-types/domain-types";
import type {
  IpcForumCreateTopicPayload,
  IpcForumListTopicsPayload,
  IpcForumListPostsPayload,
  IpcForumCreatePostPayload,
} from "@/shared/ipc-types/ipc-payloads";
import { CreateForumTopicCommand } from "./application/commands/create-forum-topic.command";
import { ListForumTopicsQuery } from "./application/queries/list-forum-topics.query";
import { ListForumPostsQuery } from "./application/queries/list-forum-posts.query";
import { CreateForumPostCommand } from "./application/commands/create-forum-post.command";

// ... (código existente)

function handleForumCreateTopic(cqrsDispatcher: CqrsDispatcher) {
  createIpcHandler<IpcForumCreateTopicPayload, IForumTopic>(
    IpcChannel.FORUM_CREATE_TOPIC,
    cqrsDispatcher,
    async (payload) => {
      const topic = (await cqrsDispatcher.dispatchCommand(
        new CreateForumTopicCommand(payload),
      )) as IForumTopic;
      return topic;
    },
  );
}

// ... (restante do código)

function handleForumListPosts(cqrsDispatcher: CqrsDispatcher) {
  createIpcHandler<IpcForumListPostsPayload, IForumPost[]>(
    IpcChannel.FORUM_LIST_POSTS,
    cqrsDispatcher,
    async (payload) => {
      const posts = (await cqrsDispatcher.dispatchQuery(
        new ListForumPostsQuery(payload),
      )) as IForumPost[];
      return posts;
    },
  );
}

function handleForumCreatePost(cqrsDispatcher: CqrsDispatcher) {
  createIpcHandler<IpcForumCreatePostPayload, IForumPost>(
    IpcChannel.FORUM_CREATE_POST,
    cqrsDispatcher,
    async (payload) => {
      const post = (await cqrsDispatcher.dispatchCommand(
        new CreateForumPostCommand(payload),
      )) as IForumPost;
      return post;
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

  createIpcHandler<IpcForumCreateTopicPayload, IForumTopic>(
    IpcChannel.FORUM_CREATE_TOPIC,
    cqrsDispatcher,
    async (payload) => {
      const topic = (await cqrsDispatcher.dispatchCommand(
        new CreateForumTopicCommand(payload),
      )) as IForumTopic;
      return topic;
    },
  );

  createIpcHandler<IpcForumListTopicsPayload, IForumTopic[]>(
    IpcChannel.FORUM_LIST_TOPICS,
    cqrsDispatcher,
    async (payload) => {
      const topics = (await cqrsDispatcher.dispatchQuery(
        new ListForumTopicsQuery(payload),
      )) as IForumTopic[];
      return topics;
    },
  );

  createIpcHandler<IpcForumListPostsPayload, IForumPost[]>(
    IpcChannel.FORUM_LIST_POSTS,
    cqrsDispatcher,
    async (payload) => {
      const posts = (await cqrsDispatcher.dispatchQuery(
        new ListForumPostsQuery(payload),
      )) as IForumPost[];
      return posts;
    },
  );

  createIpcHandler<IpcForumCreatePostPayload, IForumPost>(
    IpcChannel.FORUM_CREATE_POST,
    cqrsDispatcher,
    async (payload) => {
      const post = (await cqrsDispatcher.dispatchCommand(
        new CreateForumPostCommand(payload),
      )) as IForumPost;
      return post;
    },
  );
}
