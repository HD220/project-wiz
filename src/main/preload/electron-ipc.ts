import { ipcRenderer, IpcRendererEvent } from "electron";

import { createAgentAPI } from "./api/agent-api";
import { createChannelAPI } from "./api/channel-api";
import { createChannelMessageAPI } from "./api/channel-message-api";
import { createConversationAPI } from "./api/conversation-api";
import { createDirectMessageAPI } from "./api/direct-message-api";
import { createLlmProviderAPI } from "./api/llm-provider-api";
import { createProjectAPI } from "./api/project-api";
import { createUserAPI } from "./api/user-api";
import { createWindowAPI } from "./api/window-api";

import type { IAgentAPI } from "./api/agent-api";
import type { IChannelAPI } from "./api/channel-api";
import type { IChannelMessageAPI } from "./api/channel-message-api";
import type { IConversationAPI } from "./api/conversation-api";
import type { IDirectMessageAPI } from "./api/direct-message-api";
import type { ILlmProviderAPI } from "./api/llm-provider-api";
import type { IProjectAPI } from "./api/project-api";
import type { IUserAPI } from "./api/user-api";
import type { IWindowAPI } from "./api/window-api";

export interface IElectronIPC {
  agents: IAgentAPI;
  projects: IProjectAPI;
  channels: IChannelAPI;
  channelMessages: IChannelMessageAPI;
  users: IUserAPI;
  conversations: IConversationAPI;
  directMessages: IDirectMessageAPI;
  llmProviders: ILlmProviderAPI;
  window: IWindowAPI;
  invoke: <Channel, Payload, Response>(
    channel: Channel,
    ...args: Payload[]
  ) => Promise<Response>;
  on: (
    channel: string,
    listener: <EventResponse>(
      event: IpcRendererEvent,
      ...args: EventResponse[]
    ) => void,
  ) => () => void;
  send: <Channel, Payload>(channel: Channel, ...args: Payload[]) => void;
  removeAllListeners: <Channel>(channel: Channel) => void;
}

export function createElectronIPC(): IElectronIPC {
  return {
    agents: createAgentAPI(),
    projects: createProjectAPI(),
    channels: createChannelAPI(),
    channelMessages: createChannelMessageAPI(),
    users: createUserAPI(),
    conversations: createConversationAPI(),
    directMessages: createDirectMessageAPI(),
    llmProviders: createLlmProviderAPI(),
    window: createWindowAPI(),
    invoke: invokeGeneric,
    on: onGeneric,
    send: sendGeneric,
    removeAllListeners: removeAllListenersGeneric,
  };
}

function invokeGeneric<Channel, Payload, Response>(
  channel: Channel,
  ...args: Payload[]
): Promise<Response> {
  return ipcRenderer.invoke(channel as string, ...args);
}

function onGeneric(
  channel: string,
  listener: <EventResponse>(
    event: IpcRendererEvent,
    ...args: EventResponse[]
  ) => void,
): () => void {
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

function sendGeneric<Channel, Payload>(
  channel: Channel,
  ...args: Payload[]
): void {
  ipcRenderer.send(channel as string, ...args);
}

function removeAllListenersGeneric<Channel>(channel: Channel): void {
  ipcRenderer.removeAllListeners(channel as string);
}
