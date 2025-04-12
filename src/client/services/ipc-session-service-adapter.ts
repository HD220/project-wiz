export type SessionStatus = "running" | "paused" | "cancelled";

export class IpcSessionServiceAdapter {
  async pauseSession(): Promise<void> {
    return window.electron.invoke("session:pause");
  }

  async cancelSession(): Promise<void> {
    return window.electron.invoke("session:cancel");
  }

  async saveSession(): Promise<void> {
    return window.electron.invoke("session:save");
  }

  async restoreSession(): Promise<void> {
    return window.electron.invoke("session:restore");
  }

  async getSessionStatus(): Promise<SessionStatus> {
    return window.electron.invoke("session:getStatus");
  }
}