/**
 * Service to communicate with main process via IPC from worker
 * Provides access to main process domain operations for workers
 */

import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("worker-main-api");

export class MainProcessAPI {
  /**
   * Send message via IPC and wait for response
   * Uses MessageChannel for dedicated communication to avoid conflicts
   */
  private static async sendIPC(action: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!process.parentPort) {
        reject(new Error("No parentPort available for IPC communication"));
        return;
      }

      // Generate unique request ID
      const requestId = crypto.randomUUID();

      logger.debug("📤 Sending IPC request:", { action, requestId });

      // Store the resolver for this specific request
      this.pendingRequests.set(requestId, { resolve, reject, action });

      // Send the request
      const message = {
        requestId,
        action,
        payload,
      };

      process.parentPort.postMessage(message);

      // Timeout after 10 seconds
      setTimeout(() => {
        const pending = this.pendingRequests.get(requestId);
        if (pending) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`IPC request ${action} timed out after 10 seconds`));
        }
      }, 10000);
    });
  }

  // Static storage for pending requests
  private static pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    action: string;
  }>();

  /**
   * Handle IPC response - called by the global message handler
   */
  static handleIPCResponse(response: { requestId: string; success: boolean; result?: any; error?: string }) {
    const pending = this.pendingRequests.get(response.requestId);
    if (!pending) {
      return false; // Not our response
    }

    this.pendingRequests.delete(response.requestId);

    if (response.success) {
      logger.debug("📥 IPC response received:", {
        requestId: response.requestId,
        action: pending.action,
        success: true,
      });
      pending.resolve(response.result);
    } else {
      logger.error("📥 IPC error response:", {
        requestId: response.requestId,
        action: pending.action,
        error: response.error,
      });
      pending.reject(new Error(response.error));
    }

    return true; // We handled this response
  }

  /**
   * Send DM message via main process IPC
   */
  static async sendDMMessage(data: {
    dmId: string;
    content: string;
    authorId: string;
  }): Promise<{ messageId: string }> {
    logger.debug("🤖 Worker requesting DM message send:", {
      dmId: data.dmId,
      authorId: data.authorId,
      contentLength: data.content.length,
    });

    const result = await this.sendIPC("sendDMMessage", data);

    logger.info("✅ DM message sent via main process:", {
      messageId: result.messageId,
      dmId: data.dmId,
    });

    return result;
  }

  /**
   * Send channel message via main process IPC
   */
  static async sendChannelMessage(data: {
    channelId: string;
    content: string;
    authorId: string;
  }): Promise<{ messageId: string }> {
    logger.debug("🤖 Worker requesting channel message send:", {
      channelId: data.channelId,
      authorId: data.authorId,
      contentLength: data.content.length,
    });

    const result = await this.sendIPC("sendChannelMessage", data);

    logger.info("✅ Channel message sent via main process:", {
      messageId: result.messageId,
      channelId: data.channelId,
    });

    return result;
  }

  /**
   * Get DM conversation details
   */
  static async getDMConversation(dmId: string, ownerId: string): Promise<any> {
    logger.debug("🤖 Worker requesting DM conversation:", { dmId, ownerId });

    const result = await this.sendIPC("getDMConversation", { dmId, ownerId });

    logger.debug("✅ DM conversation retrieved via main process:", { dmId });

    return result;
  }

  /**
   * Get decrypted API key for LLM provider
   */
  static async getDecryptedApiKey(data: {
    providerId: string;
    ownerId: string;
  }): Promise<{ apiKey: string }> {
    logger.debug("🤖 Worker requesting decrypted API key:", {
      providerId: data.providerId,
      ownerId: data.ownerId,
    });

    const result = await this.sendIPC("getDecryptedApiKey", data);

    logger.debug("✅ Decrypted API key retrieved via main process:", {
      providerId: data.providerId,
    });

    return result;
  }
}
