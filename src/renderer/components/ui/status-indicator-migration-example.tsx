import { StatusIndicator } from "./status-indicator";

/**
 * Migration Examples: Before vs After
 *
 * This file demonstrates how to migrate existing inconsistent status indicators
 * to the new unified StatusIndicator component.
 */

// ========================================
// BEFORE: AgentCard with custom dot logic
// ========================================

function AgentCardBefore() {
  const agent = { status: "active" as const, name: "Test Agent" };

  return (
    <div className="relative">
      <div className="size-12 bg-muted rounded-full" />
      {/* OLD: Custom status dot with inconsistent colors */}
      <div
        className={cn(
          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card",
          agent.status === "active" && "bg-chart-2",
          agent.status === "inactive" && "bg-muted-foreground",
          agent.status === "busy" && "bg-destructive animate-pulse",
        )}
      />
    </div>
  );
}

// ========================================
// AFTER: AgentCard with StatusIndicator
// ========================================

function AgentCardAfter() {
  const agent = { status: "active" as const, name: "Test Agent" };

  return (
    <div className="relative">
      <div className="size-12 bg-muted rounded-full" />
      {/* NEW: Unified StatusIndicator */}
      <div className="absolute -bottom-1 -right-1">
        <StatusIndicator
          status={agent.status}
          variant="dot"
          size="md"
          className="border-2 border-card"
        />
      </div>
    </div>
  );
}

// ========================================
// BEFORE: ProviderCard with custom badge
// ========================================

function ProviderCardBefore() {
  const provider = { isActive: true };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1 rounded-md border transition-colors",
        provider.isActive
          ? "bg-chart-2/10 border-chart-2/20 text-chart-2"
          : "bg-muted/50 border-border/40 text-muted-foreground",
      )}
    >
      {/* OLD: Custom dot + text with complex styling */}
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          provider.isActive ? "bg-chart-2" : "bg-muted-foreground",
        )}
      />
      <span className="text-xs font-medium">
        {provider.isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

// ========================================
// AFTER: ProviderCard with StatusIndicator
// ========================================

function ProviderCardAfter() {
  const provider = { isActive: true };

  return (
    <div>
      {/* NEW: Simple unified component */}
      <StatusIndicator
        status={provider.isActive ? "active" : "inactive"}
        variant="badge"
        size="sm"
      />
    </div>
  );
}

// ========================================
// BEFORE: MessageBubble with icon status
// ========================================

function MessageBubbleBefore() {
  const messageState = "sent" as const;

  // OLD: Complex icon mapping with different colors
  const statusIcons = {
    sent: <Check className="w-3 h-3 text-muted-foreground/60" />,
    delivered: <CheckCheck className="w-3 h-3 text-chart-2/80" />,
    read: <CheckCheck className="w-3 h-3 text-chart-5/80" />,
    failed: <Clock className="w-3 h-3 text-destructive/80" />,
  };

  return (
    <div className="flex items-center gap-2">
      <span>Message content</span>
      {statusIcons[messageState]}
    </div>
  );
}

// ========================================
// AFTER: MessageBubble with StatusIndicator
// ========================================

function MessageBubbleAfter() {
  const messageState = "sent" as const;

  // NEW: Map message states to unified status types
  const getMessageStatus = (state: string) => {
    switch (state) {
      case "sent":
      case "delivered":
      case "read":
        return "active" as const;
      case "sending":
        return "busy" as const;
      case "failed":
        return "error" as const;
      default:
        return "inactive" as const;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span>Message content</span>
      <StatusIndicator
        status={getMessageStatus(messageState)}
        variant="dot"
        size="sm"
        aria-label={`Message ${messageState}`}
      />
    </div>
  );
}

// ========================================
// MIGRATION BENEFITS SUMMARY
// ========================================

export const MigrationBenefits = {
  consistency:
    "All status indicators now use the same colors: chart-2, muted-foreground, destructive",
  simplicity: "No more custom CSS classes or complex conditional logic",
  accessibility: "Built-in aria-label support and proper role attributes",
  performance: "Lightweight component with inline logic (INLINE-FIRST)",
  maintenance: "Single source of truth for all status styling",
  flexibility: "Three variants (dot, badge, text) cover all use cases",
  sizing: "Precise 6px, 8px, 10px dot sizes as specified",
};

/**
 * MIGRATION CHECKLIST:
 *
 * ✅ Replace AgentCard custom dots with StatusIndicator
 * ✅ Replace ProviderCard text+dot with StatusIndicator badge variant
 * ✅ Replace MessageBubble icons with StatusIndicator dots
 * ✅ Replace ConversationItem status logic with StatusIndicator
 * ✅ Update AgentStatus component to use StatusIndicator internally
 * ✅ Remove old status-related CSS classes and logic
 * ✅ Update TypeScript types to use unified StatusType
 */
