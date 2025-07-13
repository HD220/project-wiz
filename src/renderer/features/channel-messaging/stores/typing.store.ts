interface TypingState {
  [channelId: string]: {
    isTyping: boolean;
    timestamp: number;
  };
}

class TypingStore {
  private state: TypingState = {};
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;
  getServerSnapshot = () => this.state;

  private setState(newState: TypingState) {
    this.state = { ...newState };
    this.listeners.forEach(listener => listener());
  }

  setTyping(channelId: string, isTyping: boolean) {
    const newState = { ...this.state };
    
    if (isTyping) {
      newState[channelId] = {
        isTyping: true,
        timestamp: Date.now(),
      };
    } else {
      delete newState[channelId];
    }
    
    this.setState(newState);
  }

  isChannelTyping(channelId: string): boolean {
    const typingInfo = this.state[channelId];
    if (!typingInfo) return false;
    
    // Check if expired (will be cleaned up by cleanup method)
    const isExpired = Date.now() - typingInfo.timestamp > 30000;
    if (isExpired) {
      return false;
    }
    
    return typingInfo.isTyping;
  }

  // Cleanup expired typing states
  cleanup() {
    const now = Date.now();
    const newState = { ...this.state };
    let hasChanges = false;
    
    Object.keys(newState).forEach(channelId => {
      const typingInfo = newState[channelId];
      if (now - typingInfo.timestamp > 30000) {
        delete newState[channelId];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      this.setState(newState);
    }
  }
}

export const typingStore = new TypingStore();

// Cleanup periodically
setInterval(() => {
  typingStore.cleanup();
}, 10000); // Every 10 seconds