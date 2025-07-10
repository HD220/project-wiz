import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
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

export function registerForumModule(cqrsDispatcher: CqrsDispatcher) {
  const forumTopicRepository = new DrizzleForumTopicRepository();
  const forumPostRepository = new DrizzleForumPostRepository();

  // Forum Topic Handlers
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

  // Forum Post Handlers
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
