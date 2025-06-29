import { ipcMain, BrowserWindow } from 'electron';
import {
  GET_DMS_CHANNEL,
  GET_DM_DETAILS_CHANNEL,
  SEND_DM_MESSAGE_CHANNEL,
  DM_MESSAGE_RECEIVED_CHANNEL, // For notifying renderer about new messages
} from '../../../../shared/ipc-channels';
import { mockDMs, addMessageToMockDM } from '../mocks/dm.mocks';
import { Message } from '../../../../shared/types/entities';
import {
  GetDMsResponse,
  GetDMDetailsRequest,
  GetDMDetailsResponse,
  SendDMMessageRequest,
  SendDMMessageResponse,
  DMMessageReceivedPayload,
} from '../../../../shared/ipc-types/dm';

// Helper to send messages to all renderer windows
function notifyAllWindows(channel: string, payload: any) {
  BrowserWindow.getAllWindows().forEach(win => {
    // Ensure the window and its webContents are not destroyed
    if (!win.isDestroyed() && win.webContents && !win.webContents.isDestroyed()) {
      win.webContents.send(channel, payload);
    }
  });
}

export function registerDMHandlers() {
  ipcMain.handle(GET_DMS_CHANNEL, async (): Promise<GetDMsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    // Return DMs without full messages, just participants and last message snippet if needed
    // For simplicity, returning all DMs with messages for now.
    // In a real app, you might paginate or summarize.
    return { dms: mockDMs };
  });

  ipcMain.handle(GET_DM_DETAILS_CHANNEL, async (_event, req: GetDMDetailsRequest): Promise<GetDMDetailsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const dm = mockDMs.find(d => d.id === req.dmId);
    if (dm) {
      return { dm };
    } else {
      return { dm: undefined, error: 'DM not found' };
    }
  });

  ipcMain.handle(SEND_DM_MESSAGE_CHANNEL, async (_event, req: SendDMMessageRequest): Promise<SendDMMessageResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const { dmId, content, senderId } = req;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: dmId,
      senderId: senderId, // Should be the current user or agent sending
      content: content,
      contentType: 'text', // Assuming text for now
      timestamp: new Date().toISOString(),
    };

    const updatedDM = addMessageToMockDM(dmId, newMessage);

    if (updatedDM) {
      // Notify all renderer processes that a new message has been added to this DM
      const notificationPayload: DMMessageReceivedPayload = {
        dmId: dmId,
        message: newMessage,
      };
      notifyAllWindows(DM_MESSAGE_RECEIVED_CHANNEL, notificationPayload);

      // Simulate agent auto-reply for demonstration if sender is not agent-1
      // and agent-1 is a participant in this DM.
      const dmParticipants = updatedDM.participantIds || [];
      if (senderId !== 'agent-1' && dmParticipants.includes('agent-1')) {
        setTimeout(() => {
          const agentReply: Message = {
            id: `msg-agent-${Date.now()}`,
            conversationId: dmId,
            senderId: 'agent-1', // Agent replies
            content: `Got it! You said: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
            contentType: 'text',
            timestamp: new Date().toISOString(),
          };
          const finalDM = addMessageToMockDM(dmId, agentReply); // Important to get the latest DM state
          if (finalDM) { // Check if DM still exists
            const agentNotificationPayload: DMMessageReceivedPayload = {
              dmId: dmId,
              message: agentReply,
            };
            notifyAllWindows(DM_MESSAGE_RECEIVED_CHANNEL, agentNotificationPayload);
          }
        }, 1000 + Math.random() * 1000); // Simulate delay
      }

      return { success: true, message: newMessage };
    } else {
      return { success: false, error: 'DM not found or failed to send message' };
    }
  });
}
