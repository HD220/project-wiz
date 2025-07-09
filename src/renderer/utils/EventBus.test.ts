// Import the actual class, not the singleton instance, for isolated testing
// To do this, EventBus.ts might need to export the class itself.
// For now, let's assume EventBus.ts is like:
// export class MockEventBus { ... }
// export const eventBus = new MockEventBus();
// If MockEventBus class is not exported, we test the singleton, which is okay for this scale.

import { eventBus } from './EventBus'; // Using the exported singleton instance

describe('MockEventBus', () => {
  let bus: typeof eventBus; // Type it as the instance type
  let handler1: jest.Mock;
  let handler2: jest.Mock;

  beforeEach(() => {
    // To ensure tests are isolated, we need a fresh EventBus or to clean the existing one.
    // Since we're importing a singleton, we must manually clean its internal state.
    // This is a downside of testing singletons directly.
    // A better approach would be: `bus = new MockEventBus();` if class were exported.

    // "Cleaning" the singleton for each test:
    // This requires either exposing a reset method on the singleton (not ideal for prod code)
    // or re-requireing the module (can be complex with Jest module caching).
    // For this mock, we'll assume that its internal `events` object can be cleared,
    // or we test its behavior understanding it's a shared instance.

    // Given the current structure (singleton `eventBus`), we'll test it as is,
    // being mindful that listeners might persist if not explicitly removed in tests.
    // Best practice for testing would be to instantiate `new MockEventBus()` per test.
    // Let's proceed by creating a new instance for testing if the class was exported.
    // Since it's not, we'll have to manage listeners carefully.

    // For the purpose of this test, let's assume we can 'reset' the singleton for each test run
    // by directly manipulating its internal 'events' property if it were accessible,
    // or by ensuring each test cleans up its own listeners.
    // The provided EventBus code doesn't offer a reset.
    // So, tests will add/remove listeners to the global `eventBus`.

    bus = eventBus; // Using the global singleton
    handler1 = jest.fn();
    handler2 = jest.fn();

    // Clean up listeners from previous tests if any were left (problematic with singletons)
    // This is a workaround: Try to remove handlers if they were added in a previous test.
    // This is NOT robust. Exporting the class is better.
    if ((bus as any).events['test-event']) {
        (bus as any).events['test-event'] = [];
    }
    if ((bus as any).events['another-event']) {
        (bus as any).events['another-event'] = [];
    }
  });

  afterEach(() => {
    // Ensure all listeners added during a test are removed.
    bus.off('test-event', handler1);
    bus.off('test-event', handler2);
    bus.off('another-event', handler1);
  });

  test('should register an event listener with on()', () => {
    bus.on('test-event', handler1);
    // This is hard to assert directly without inspecting internals or emitting.
    // We'll verify by emitting.
    bus.emit('test-event');
    expect(handler1).toHaveBeenCalledTimes(1);
  });

  test('should emit event to the correct listener', () => {
    bus.on('test-event', handler1);
    bus.on('another-event', handler2);
    bus.emit('test-event', 'payload1');
    expect(handler1).toHaveBeenCalledWith('payload1');
    expect(handler2).not.toHaveBeenCalled();
  });

  test('should emit event to all listeners for that event', () => {
    bus.on('test-event', handler1);
    bus.on('test-event', handler2);
    bus.emit('test-event', 'payload');
    expect(handler1).toHaveBeenCalledWith('payload');
    expect(handler2).toHaveBeenCalledWith('payload');
  });

  test('should unregister a specific listener with off()', () => {
    bus.on('test-event', handler1);
    bus.on('test-event', handler2);
    bus.off('test-event', handler1);
    bus.emit('test-event', 'payload');
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith('payload');
  });

  test('off() should not affect other listeners for the same event', () => {
    bus.on('test-event', handler1);
    bus.on('test-event', handler2);
    bus.off('test-event', handler1);
    expect(handler2).not.toHaveBeenCalled(); // emit hasn't happened yet for handler2 check
    bus.emit('test-event');
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  test('off() should do nothing if eventName does not exist', () => {
    expect(() => bus.off('nonexistent-event', handler1)).not.toThrow();
  });

  test('off() should do nothing if listener does not exist for that event', () => {
    bus.on('test-event', handler1);
    expect(() => bus.off('test-event', handler2)).not.toThrow();
    bus.emit('test-event');
    expect(handler1).toHaveBeenCalledTimes(1); // handler1 should still be there
  });

  test('emit() should do nothing if eventName does not exist', () => {
    expect(() => bus.emit('nonexistent-event')).not.toThrow();
    expect(handler1).not.toHaveBeenCalled();
  });

  test('emit() should pass data to listener', () => {
    const data = { key: 'value' };
    bus.on('test-event', handler1);
    bus.emit('test-event', data);
    expect(handler1).toHaveBeenCalledWith(data);
  });

  test('emit() should work if data is undefined', () => {
    bus.on('test-event', handler1);
    bus.emit('test-event'); // No data
    expect(handler1).toHaveBeenCalledWith(undefined);
  });
});
