
import { ipcMain } from 'electron'
import { CqrsDispatcher } from '@/main/kernel/cqrs-dispatcher'
import {
  IpcForumListTopicsResponse,
  IpcForumCreateTopicPayload,
  IpcForumCreateTopicResponse,
  IpcForumListPostsPayload,
  IpcForumListPostsResponse,
  IpcForumCreatePostPayload,
  IpcForumCreatePostResponse,
  IForumTopic,
  IForumPost,
} from '@/shared/ipc-types/entities'
import { ListForumTopicsQuery } from './application/queries/list-forum-topics.query'
import { CreateForumTopicCommand } from './application/commands/create-forum-topic.command'
import { ListForumPostsQuery } from './application/queries/list-forum-posts.query'
import { CreateForumPostCommand } from './application/commands/create-forum-post.command'

export function registerForumHandlers(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    'forum:list-topics',
    async (): Promise<IpcForumListTopicsResponse> => {
      try {
        const topics = (await cqrsDispatcher.dispatchQuery(
          new ListForumTopicsQuery(),
        )) as IForumTopic[]
        return { success: true, data: topics }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )

  ipcMain.handle(
    'forum:create-topic',
    async (
      _,
      payload: IpcForumCreateTopicPayload,
    ): Promise<IpcForumCreateTopicResponse> => {
      try {
        const topic = (await cqrsDispatcher.dispatchCommand(
          new CreateForumTopicCommand(payload),
        )) as IForumTopic
        return { success: true, data: topic }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )

  ipcMain.handle(
    'forum:list-posts',
    async (
      _,
      payload: IpcForumListPostsPayload,
    ): Promise<IpcForumListPostsResponse> => {
      try {
        const posts = (await cqrsDispatcher.dispatchQuery(
          new ListForumPostsQuery(payload),
        )) as IForumPost[]
        return { success: true, data: posts }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )

  ipcMain.handle(
    'forum:create-post',
    async (
      _,
      payload: IpcForumCreatePostPayload,
    ): Promise<IpcForumCreatePostResponse> => {
      try {
        const post = (await cqrsDispatcher.dispatchCommand(
          new CreateForumPostCommand(payload),
        )) as IForumPost
        return { success: true, data: post }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )
}
