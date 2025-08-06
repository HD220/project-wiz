// Window API types - module augmentations from IPC handlers are automatically included
declare global {
  interface Window {
    api: WindowAPI.API;
  }

  namespace WindowAPI {
    interface API {
      // System information
      platform: string;
      version: string;

      // All features using new colocated IPC architecture
      auth: Auth;
      user: User;
      project: Project;
      agent: Agent;
      llmProvider: LlmProvider;
      dm: Dm;
      channel: Channel;
      profile: Profile;
      window: Window;
      event: Event;
    }
  }
}

export {};