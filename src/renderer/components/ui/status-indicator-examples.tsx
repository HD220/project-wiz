import { StatusIndicator } from "./status-indicator";

/**
 * Examples demonstrating the unified StatusIndicator component usage
 * This file shows all variants and status types for reference
 */

export function StatusIndicatorExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Status Indicator Examples</h2>

      {/* Dot variant examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Dot Variant (default)</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StatusIndicator status="active" variant="dot" size="sm" />
            <span className="text-sm">Active (small)</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status="inactive" variant="dot" size="md" />
            <span className="text-sm">Inactive (medium)</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status="busy" variant="dot" size="lg" />
            <span className="text-sm">Busy (large, animated)</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status="error" variant="dot" size="md" />
            <span className="text-sm">Error</span>
          </div>
        </div>
      </section>

      {/* Badge variant examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Badge Variant (dot + text)</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <StatusIndicator status="active" variant="badge" size="sm" />
          <StatusIndicator status="inactive" variant="badge" size="md" />
          <StatusIndicator status="busy" variant="badge" size="lg" />
          <StatusIndicator status="error" variant="badge" size="md" />
        </div>
      </section>

      {/* Text variant examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Text Variant (text only)</h3>
        <div className="flex items-center gap-4">
          <StatusIndicator status="active" variant="text" size="sm" />
          <StatusIndicator status="inactive" variant="text" size="md" />
          <StatusIndicator status="busy" variant="text" size="lg" />
          <StatusIndicator status="error" variant="text" size="md" />
        </div>
      </section>

      {/* Real usage examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Real Usage Examples</h3>

        {/* Agent Card Style */}
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <div className="relative">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="absolute -bottom-1 -right-1">
              <StatusIndicator status="active" variant="dot" size="md" />
            </div>
          </div>
          <div>
            <p className="font-medium">Agent Card with Status Dot</p>
            <p className="text-sm text-muted-foreground">
              Similar to current AgentCard usage
            </p>
          </div>
        </div>

        {/* Provider Card Style */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">LLM Provider</p>
            <p className="text-sm text-muted-foreground">OpenAI GPT-4</p>
          </div>
          <StatusIndicator status="active" variant="badge" size="sm" />
        </div>

        {/* Message Status Style */}
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          <p className="text-sm">Message delivery status:</p>
          <StatusIndicator status="busy" variant="text" size="sm" />
        </div>

        {/* Conversation Status Style */}
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          <div className="w-8 h-8 bg-muted rounded-full" />
          <div className="flex-1">
            <p className="font-medium">Conversation</p>
            <p className="text-sm text-muted-foreground">Last message...</p>
          </div>
          <StatusIndicator status="error" variant="dot" size="sm" />
        </div>
      </section>
    </div>
  );
}

/**
 * Usage Examples in Code:
 *
 * // Simple dot indicator
 * <StatusIndicator status="active" />
 *
 * // Badge with custom size
 * <StatusIndicator status="busy" variant="badge" size="lg" />
 *
 * // Text only with accessibility
 * <StatusIndicator
 *   status="error"
 *   variant="text"
 *   aria-label="Connection error detected"
 * />
 *
 * // Custom styling
 * <StatusIndicator
 *   status="active"
 *   variant="dot"
 *   className="border-2 border-card"
 * />
 */
