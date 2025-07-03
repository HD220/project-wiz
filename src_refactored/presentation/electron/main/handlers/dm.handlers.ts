import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from "electron";

import {
  IPC_CHANNELS
} from "../../../../shared/ipc-channels";
import {
  GetDMConversationsListResponseData,
  GetDMDetailsRequest,
  GetDMDetailsResponseData,
  SendDMMessageRequest,
  SendDMMessageResponseData,
  DMMessageReceivedEventPayload,
} from "../../../../shared/ipc-types";
import { ChatMessage } from "../../../../shared/types/entities";
import { mockDMs, addMessageToMockDM } from "../mocks/dm.mocks";

function notifyAllWindows(channel: string, payload: unknown) {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (
      !win.isDestroyed() &&
      win.webContents &&
      !win.webContents.isDestroyed()
    ) {
      win.webContents.send(channel, payload);
    }
  });
}

// Helper to simulate an agent's reply
function simulateAgentReply(dmId: string, originalContent: string, updatedDM: { participantIds?: string[] }): void {
  const dmParticipants = updatedDM.participantIds || [];
  // Check if the sender is not the agent and the agent is a participant
  // Avoid self-reply loop
  if (dmParticipants.includes("agent-1") && !originalContent.startsWith("Got it! You said:")) {
    setTimeout(() => {
      const agentReplyContent = `Got it! You said: "${originalContent.substring(0, 30)}${
        originalContent.length > 30 ? "..." : ""
      }"`;
      const agentReply: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        conversationId: dmId,
        // Assuming agent's ID is 'agent-1'
        senderId: "agent-1",
        content: agentReplyContent,
        contentType: "text",
        timestamp: new Date().toISOString(),
      };
      const finalDM = addMessageToMockDM(dmId, agentReply);
      if (finalDM) {
        const agentNotificationPayload: DMMessageReceivedEventPayload = {
          dmId: dmId,
          message: agentReply,
        };
        notifyAllWindows(
          IPC_CHANNELS.DM_MESSAGE_RECEIVED,
          agentNotificationPayload
        );
      }
    }, 1000 + Math.random() * 1000);
  }
}

async function handleSendDMMessage(
  _event: IpcMainInvokeEvent,
  req: SendDMMessageRequest
): Promise<SendDMMessageResponseData> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const { dmId, content, senderId } = req;

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    conversationId: dmId,
    senderId: senderId,
    content: content,
    contentType: "text",
    timestamp: new Date().toISOString(),
  };

  const updatedDM = addMessageToMockDM(dmId, newMessage);

  if (updatedDM) {
    const notificationPayload: DMMessageReceivedEventPayload = {
      dmId: dmId,
      message: newMessage,
    };
    notifyAllWindows(IPC_CHANNELS.DM_MESSAGE_RECEIVED, notificationPayload);

    // Simulate agent reply only if sender is not the agent
    if (senderId !== "agent-1") {
      simulateAgentReply(dmId, content, updatedDM);
    }
    return { success: true, message: newMessage };
  }
  return {
    success: false,
    error: "DM not found or failed to send message",
  };
}


function registerQueryDMHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST, async (): Promise<GetDMConversationsListResponseData> => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { dms: mockDMs };
  });

  ipcMain.handle(
    IPC_CHANNELS.GET_DM_DETAILS,
    async (
      _event: IpcMainInvokeEvent,
      req: GetDMDetailsRequest
    ): Promise<GetDMDetailsResponseData> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const dm = mockDMs.find((dmEntry) => dmEntry.id === req.dmId);
      if (dm) {
        return { dm };
      }
      return { dm: undefined, error: "DM not found" };
    }
  );
}

export function registerDMHandlers() {
  registerQueryDMHandlers();
  ipcMain.handle(IPC_CHANNELS.SEND_DM_MESSAGE, handleSendDMMessage);
}
