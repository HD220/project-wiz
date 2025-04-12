import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

type ProgressProps = {
  /**
   * The current value of the progress bar.
   */
  value: number
  /**
   * The minimum value of the progress bar (default: 0).
   */
  min?: number
  /**
   * The maximum value of the progress bar (default: 100).
   */
  max?: number
  /**
   * Accessible label for the progress bar. If provided, maps to aria-label.
   */
  label?: string
  /**
   * aria-label for the progress bar. Takes precedence over label if both are provided.
   */
  "aria-label"?: string
  /**
   * aria-labelledby for the progress bar.
   */
  "aria-labelledby"?: string
  /**
   * Additional class names for the root element.
   */
  className?: string
} & Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value" | "min" | "max" | "aria-label" | "aria-labelledby">

/**
 * Progress
 *
 * Accessible progress bar component.
 *
 * Accessibility:
 * - Sets role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax.
 * - Supports aria-label, aria-labelledby, and a convenience label prop.
 * - aria-label takes precedence over label if both are provided.
 *
 * Usage examples:
 *
 * // Basic usage with default min/max and accessible label
 * <Progress value={40} label="Loading data" />
 *
 * // Custom min/max values and aria-labelledby
 * <div>
 *   <span id="upload-label">Uploading files</span>
 *   <Progress value={30} min={0} max={200} aria-labelledby="upload-label" />
 * </div>
 *
 * // Using aria-label directly
 * <Progress value={75} aria-label="Profile completion" />
 */
function Progress({
  value,
  min = 0,
  max = 100,
  label,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  ...props
}: ProgressProps) {
  // Determine which label to use for accessibility
  const computedAriaLabel = ariaLabel ?? label

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={computedAriaLabel}
      aria-labelledby={ariaLabelledBy}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - ((value - min) / (max - min) * 100)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
