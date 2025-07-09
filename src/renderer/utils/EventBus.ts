interface EventListener { (data?: any): void; }
interface Events { [eventName: string]: EventListener[]; }

class MockEventBus {
  private events: Events = {};

  on(eventName: string, listener: EventListener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  off(eventName: string, listener: EventListener) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(l => l !== listener);
  }

  emit(eventName: string, data?: any) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(listener => listener(data));
  }
}

export const eventBus = new MockEventBus(); // Singleton instance
