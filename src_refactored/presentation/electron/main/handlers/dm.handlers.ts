import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from "electron";

import {
  IPC_CHANNELS
} from "../../../../shared/ipc-channels";
import {
  GetDMConversationsListResponse,
  GetDMDetailsRequest,
  GetDMDetailsResponse,
  SendDMMessageRequest,
  DMMessageReceivedEventPayload,
} from "../../../../shared/ipc-types/chat.types";
import { ChatMessage, DirectMessageItem } from "@/domain/entities/chat";
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
        sender: { id: "agent-1", name: "Agent", type: "agent" },
        content: agentReplyContent,
        
        type: "text",
        timestamp: new Date().toISOString(),
      };
      const finalDM = addMessageToMockDM(dmId, agentReply);
      if (finalDM) {
        const agentNotificationPayload: DMMessageReceivedEventPayload = {
          conversationId: dmId,
          message: agentReply,
        };
        notifyAllWindows(
          IPC_CHANNELS.DM_MESSAGE_RECEIVED_EVENT,
          agentNotificationPayload
        );
      }
    }, 1000 + Math.random() * 1000);
  }
}

async function handleSendDMMessage(
  _event: IpcMainInvokeEvent,
  req: SendDMMessageRequest
): Promise<ChatMessage> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const { dmId, content, senderId } = req;

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    conversationId: dmId,
    sender: { id: senderId, name: "User", type: "user" },
    content: content,
    
    type: "text",
    timestamp: new Date().toISOString(),
  };

  const updatedDM = addMessageToMockDM(dmId, newMessage);

  if (updatedDM) {
    const notificationPayload: DMMessageReceivedEventPayload = {
      conversationId: dmId,
      message: newMessage,
    };
    notifyAllWindows(IPC_CHANNELS.DM_MESSAGE_RECEIVED_EVENT, notificationPayload);

    // Simulate agent reply only if sender is not the agent
    if (senderId !== "agent-1") {
      simulateAgentReply(dmId, content, updatedDM);
    }
    return newMessage;
  }
  throw new Error("DM not found or failed to send message");
}


function registerQueryDMHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST, async (): Promise<DirectMessageItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockDMs;
  });

  ipcMain.handle(
    IPC_CHANNELS.GET_DM_DETAILS,
    async (
      _event: IpcMainInvokeEvent,
      req: GetDMDetailsRequest
    ): Promise<DirectMessageItem | null> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const dm = mockDMs.find((dmEntry) => dmEntry.id === req.dmId);
      if (dm) {
        return dm;
      }
      throw new Error("DM not found");
    }
  );
}

export function registerDMHandlers() {
  registerQueryDMHandlers();
  ipcMain.handle(IPC_CHANNELS.SEND_DM_MESSAGE, handleSendDMMessage);
}
