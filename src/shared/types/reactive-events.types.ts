/**
 * Reactive Events Type Definitions
 *
 * Central type definitions for the reactive event system.
 * Provides type-safe event emission and consumption across main and renderer processes.
 */

/**
 * Complete event definitions mapping domains to their possible actions and data structures
 */
export interface EventDefinitions {
  messages: {
    sent: { key: string; messageId: string; authorId: string };
    edited: { key: string; messageId: string; content: string };
    deleted: { key: string; messageId: string };
    "typing-start": { key: string; userId: string };
    "typing-stop": { key: string; userId: string };
  };

  conversations: {
    created: { key: string; type: "dm" | "channel" };
    archived: { key: string };
    unarchived: { key: string };
    "message-sent": { key: string; lastMessageId: string };
    updated: { key: string; name?: string };
    "participant-added": { key: string; userId: string };
    "participant-removed": { key: string; userId: string };
  };

  users: {
    "status-changed": {
      key: string;
      status: "online" | "offline" | "busy" | "away";
    };
    activated: { key: string };
    deactivated: { key: string };
    created: { key: string; userType: "human" | "agent" };
    updated: { key: string; changes: Record<string, unknown> };
  };

  agents: {
    activated: { key: string };
    deactivated: { key: string };
    "status-changed": {
      key: string;
      status: "idle" | "working" | "error" | "offline";
    };
    created: { key: string; providerId: string };
    updated: { key: string; changes: Record<string, unknown> };
  };

  llmProviders: {
    created: { key: string; provider: string };
    updated: { key: string; changes: Record<string, unknown> };
    deactivated: { key: string };
    "default-changed": { key: string; previousDefaultId?: string };
  };

  projects: {
    created: { key: string; name: string };
    updated: { key: string; changes: Record<string, unknown> };
    archived: { key: string };
    unarchived: { key: string };
  };
}

/**
 * Extract all valid event domains
 */
export type EventDomain = keyof EventDefinitions;

/**
 * Extract all valid actions for a specific domain
 */
export type EventAction<TDomain extends EventDomain> =
  keyof EventDefinitions[TDomain];

/**
 * Base event data structure - all events must have a key
 */
type BaseEventData = {
  key: string;
};

/**
 * Extract the data type for a specific domain and action combination
 */
export type EventData<
  TDomain extends EventDomain,
  TAction extends EventAction<TDomain>,
> = EventDefinitions[TDomain][TAction] & BaseEventData;

/**
 * Complete event payload structure sent through IPC
 */
export type EventPayload<
  TDomain extends EventDomain,
  TAction extends EventAction<TDomain>,
> = {
  action: TAction;
} & EventData<TDomain, TAction>;

/**
 * Event listener callback type
 */
export type EventListener<
  TDomain extends EventDomain,
  TAction extends EventAction<TDomain> = EventAction<TDomain>,
> = (data: EventPayload<TDomain, TAction>) => void;

/**
 * Event pattern for domain-specific listening
 */
export type EventPattern<TDomain extends EventDomain> = `event:${TDomain}`;
