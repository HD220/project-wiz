declare global {
  interface Window {
    api: {
      platform: string;
      version: string;
    };
  }
}

export {};
