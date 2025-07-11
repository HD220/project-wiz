import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { db } from "@/main/persistence/db";
import { DrizzleForumTopicRepository } from "./persistence/drizzle-forum-topic.repository";
import { DrizzleForumPostRepository } from "./persistence/drizzle-forum-post.repository";
import { CreateForumTopicCommandHandler } from "./application/commands/create-forum-topic.command";
import { ListForumTopicsQueryHandler } from "./application/queries/list-forum-topics.query";
import { UpdateForumTopicCommandHandler } from "./application/commands/update-forum-topic.command";
import { RemoveForumTopicCommandHandler } from "./application/commands/remove-forum-topic.command";
import { GetForumTopicQueryHandler } from "./application/queries/get-forum-topic.query";
import { CreateForumPostCommandHandler } from "./application/commands/create-forum-post.command";
import { ListForumPostsQueryHandler } from "./application/queries/list-forum-posts.query";
import { UpdateForumPostCommandHandler } from "./application/commands/update-forum-post.command";
import { RemoveForumPostCommandHandler } from "./application/commands/remove-forum-post.command";
import { GetForumPostQueryHandler } from "./application/queries/get-forum-post.query";
import { registerForumIpcHandlers } from "./infrastructure/forum.handler";

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

export function registerForumModule(
  cqrsDispatcher: CqrsDispatcher,
  logger: any,
) {
  const forumTopicRepository = new DrizzleForumTopicRepository(db);
  const forumPostRepository = new DrizzleForumPostRepository(db);

  registerForumTopicHandlers(cqrsDispatcher, forumTopicRepository);
  registerForumPostHandlers(cqrsDispatcher, forumPostRepository);
  registerForumIpcHandlers(cqrsDispatcher);
}
