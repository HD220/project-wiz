interface Message {
  id: number;
  timestamp: string;
  type: 'prompt' | 'response';
  content: string;
}

class ConversationService {
  private history: Message[] = [];

  constructor() {
    // TODO: Load history from local database
  }

  addMessage(message: Message) {
    this.history.push(message);
    // TODO: Save to local database
  }

  getHistory(): Message[] {
    return this.history;
  }

  exportHistory(): string {
    return JSON.stringify(this.history);
  }
}

export default ConversationService;