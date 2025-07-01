import { ipcMain, BrowserWindow } from "electron";

import {
  GET_DMS_CHANNEL,
  GET_DM_DETAILS_CHANNEL,
  SEND_DM_MESSAGE_CHANNEL,
  DM_MESSAGE_RECEIVED_CHANNEL,
} from "../../../../shared/ipc-channels";
import {
  GetDMsResponse,
  GetDMDetailsRequest,
  GetDMDetailsResponse,
  SendDMMessageRequest,
  SendDMMessageResponse,
  DMMessageReceivedPayload,
} from "../../../../shared/ipc-types"; // Corrected path
import { Message } from "../../../../shared/types/entities";
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

// Helper function to handle the logic for sending a DM message
async function _handleSendDMMessage(
  _event: Electron.IpcMainInvokeEvent,
  req: SendDMMessageRequest
): Promise<SendDMMessageResponse> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const { dmId, content, senderId } = req;

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    conversationId: dmId,
    senderId: senderId,
    content: content,
    contentType: "text",
    timestamp: new Date().toISOString(),
  };

  const updatedDM = addMessageToMockDM(dmId, newMessage);

  if (updatedDM) {
    const notificationPayload: DMMessageReceivedPayload = {
      dmId: dmId,
      message: newMessage,
    };
    notifyAllWindows(DM_MESSAGE_RECEIVED_CHANNEL, notificationPayload);

    // Simulate agent reply
    const dmParticipants = updatedDM.participantIds || [];
    if (senderId !== "agent-1" && dmParticipants.includes("agent-1")) {
      setTimeout(() => {
        const agentReply: Message = {
          id: `msg-agent-${Date.now()}`,
          conversationId: dmId,
          senderId: "agent-1",
          content: `Got it! You said: "${content.substring(0, 30)}${
            content.length > 30 ? "..." : ""
          }"`,
          contentType: "text",
          timestamp: new Date().toISOString(),
        };
        const finalDM = addMessageToMockDM(dmId, agentReply);
        if (finalDM) {
          const agentNotificationPayload: DMMessageReceivedPayload = {
            dmId: dmId,
            message: agentReply,
          };
          notifyAllWindows(
            DM_MESSAGE_RECEIVED_CHANNEL,
            agentNotificationPayload
          );
        }
      }, 1000 + Math.random() * 1000);
    }
    return { success: true, message: newMessage };
  }
  return {
    success: false,
    error: "DM not found or failed to send message",
  };
}

function _registerQueryDMHandlers() {
  ipcMain.handle(GET_DMS_CHANNEL, async (): Promise<GetDMsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { dms: mockDMs };
  });

  ipcMain.handle(
    GET_DM_DETAILS_CHANNEL,
    async (
      _event: Electron.IpcMainInvokeEvent,
      req: GetDMDetailsRequest
    ): Promise<GetDMDetailsResponse> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const dm = mockDMs.find((d) => d.id === req.dmId);
      if (dm) {
        return { dm };
      }
      return { dm: undefined, error: "DM not found" };
    }
  );
}

export function registerDMHandlers() {
  _registerQueryDMHandlers();
  ipcMain.handle(SEND_DM_MESSAGE_CHANNEL, _handleSendDMMessage);
}
