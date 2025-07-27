import { createContext, useContext } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/renderer/lib/utils";
import { Badge } from "@/renderer/components/ui/badge";
import { Separator } from "@/renderer/components/ui/separator";

// Context for compound component communication
interface DataDisplayContextValue {
  variant: "card" | "list" | "grid" | "inline";
  density: "compact" | "comfortable" | "spacious";
  orientation: "horizontal" | "vertical";
}

const DataDisplayContext = createContext<DataDisplayContextValue | null>(null);

function useDataDisplayContext() {
  const context = useContext(DataDisplayContext);
  if (!context) {
    throw new Error(
      "DataDisplay components must be used within DataDisplay.Root",
    );
  }
  return context;
}

// Root component variants
const dataDisplayVariants = cva("space-y-1", {
  variants: {
    variant: {
      card: "rounded-lg border bg-card p-4",
      list: "space-y-2",
      grid: "grid gap-4",
      inline: "inline-flex items-center gap-4",
    },
    density: {
      compact: "",
      comfortable: "",
      spacious: "",
    },
    orientation: {
      horizontal: "",
      vertical: "",
    },
  },
  compoundVariants: [
    // Density adjustments for card variant
    {
      variant: "card",
      density: "compact",
      className: "p-3 space-y-2",
    },
    {
      variant: "card",
      density: "spacious",
      className: "p-6 space-y-4",
    },
    // Density adjustments for list variant
    {
      variant: "list",
      density: "compact",
      className: "space-y-1",
    },
    {
      variant: "list",
      density: "spacious",
      className: "space-y-4",
    },
    // Orientation adjustments for inline variant
    {
      variant: "inline",
      orientation: "vertical",
      className: "flex-col items-start gap-2",
    },
  ],
  defaultVariants: {
    variant: "card",
    density: "comfortable",
    orientation: "horizontal",
  },
});

// Root component
interface DataDisplayRootProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof dataDisplayVariants> {}

export function DataDisplayRoot(props: DataDisplayRootProps) {
  const {
    variant = "card",
    density = "comfortable",
    orientation = "horizontal",
    className,
    children,
    ...rest
  } = props;

  return (
    <DataDisplayContext.Provider
      value={{
        variant: variant || "card",
        density: density || "comfortable",
        orientation: orientation || "horizontal",
      }}
    >
      <div
        data-slot="data-display"
        className={cn(
          dataDisplayVariants({ variant, density, orientation }),
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </DataDisplayContext.Provider>
  );
}

// Group component for related items
const groupVariants = cva("", {
  variants: {
    variant: {
      card: "space-y-3",
      list: "space-y-2",
      grid: "space-y-2",
      inline: "flex items-center gap-3",
    },
    density: {
      compact: "",
      comfortable: "",
      spacious: "",
    },
  },
  compoundVariants: [
    {
      variant: "card",
      density: "compact",
      className: "space-y-2",
    },
    {
      variant: "card",
      density: "spacious",
      className: "space-y-4",
    },
  ],
});

interface DataDisplayGroupProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
}

export function DataDisplayGroup(props: DataDisplayGroupProps) {
  const { title, description, className, children, ...rest } = props;
  const { variant, density } = useDataDisplayContext();

  return (
    <div
      data-slot="data-display-group"
      className={cn(groupVariants({ variant, density }), className)}
      {...rest}
    >
      {title && (
        <div className="space-y-1">
          <h4 className="font-medium text-sm leading-none">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Item component for individual data points
const itemVariants = cva("flex", {
  variants: {
    variant: {
      card: "justify-between items-start",
      list: "justify-between items-center py-1",
      grid: "flex-col space-y-1",
      inline: "items-center gap-2",
    },
    density: {
      compact: "",
      comfortable: "",
      spacious: "",
    },
  },
  compoundVariants: [
    {
      variant: "list",
      density: "compact",
      className: "py-0.5",
    },
    {
      variant: "list",
      density: "spacious",
      className: "py-2",
    },
  ],
});

interface DataDisplayItemProps extends React.ComponentProps<"div"> {}

export function DataDisplayItem(props: DataDisplayItemProps) {
  const { className, children, ...rest } = props;
  const { variant, density } = useDataDisplayContext();

  return (
    <div
      data-slot="data-display-item"
      className={cn(itemVariants({ variant, density }), className)}
      {...rest}
    >
      {children}
    </div>
  );
}

// Label component
const labelVariants = cva("font-medium", {
  variants: {
    variant: {
      card: "text-sm text-muted-foreground",
      list: "text-sm text-muted-foreground",
      grid: "text-xs text-muted-foreground uppercase tracking-wider",
      inline: "text-sm text-muted-foreground",
    },
  },
});

interface DataDisplayLabelProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

export function DataDisplayLabel(props: DataDisplayLabelProps) {
  const { className, asChild = false, children, ...rest } = props;
  const { variant } = useDataDisplayContext();
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="data-display-label"
      className={cn(labelVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Value component
const valueVariants = cva("", {
  variants: {
    variant: {
      card: "text-sm font-medium",
      list: "text-sm",
      grid: "text-base font-semibold",
      inline: "text-sm font-medium",
    },
  },
});

interface DataDisplayValueProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

export function DataDisplayValue(props: DataDisplayValueProps) {
  const { className, asChild = false, children, ...rest } = props;
  const { variant } = useDataDisplayContext();
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="data-display-value"
      className={cn(valueVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Badge component wrapper for data values
interface DataDisplayBadgeProps extends React.ComponentProps<typeof Badge> {}

export function DataDisplayBadge(props: DataDisplayBadgeProps) {
  const { className, children, ...rest } = props;

  return (
    <Badge
      data-slot="data-display-badge"
      variant="outline"
      className={cn("font-medium", className)}
      {...rest}
    >
      {children}
    </Badge>
  );
}

// Separator component for grouping
interface DataDisplaySeparatorProps
  extends React.ComponentProps<typeof Separator> {}

export function DataDisplaySeparator(props: DataDisplaySeparatorProps) {
  const { className, ...rest } = props;

  return (
    <Separator
      data-slot="data-display-separator"
      className={cn("my-2", className)}
      {...rest}
    />
  );
}

// Header component for titles and actions
interface DataDisplayHeaderProps extends React.ComponentProps<"div"> {}

export function DataDisplayHeader(props: DataDisplayHeaderProps) {
  const { className, children, ...rest } = props;

  return (
    <div
      data-slot="data-display-header"
      className={cn("flex items-center justify-between mb-4", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

// Title component
interface DataDisplayTitleProps extends React.ComponentProps<"h3"> {
  asChild?: boolean;
}

export function DataDisplayTitle(props: DataDisplayTitleProps) {
  const { className, asChild = false, children, ...rest } = props;
  const Comp = asChild ? Slot : "h3";

  return (
    <Comp
      data-slot="data-display-title"
      className={cn("font-semibold text-lg leading-none", className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Action component for interactive elements
interface DataDisplayActionProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

export function DataDisplayAction(props: DataDisplayActionProps) {
  const { className, asChild = false, children, ...rest } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="data-display-action"
      className={cn("flex items-center gap-2", className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Empty state component
interface DataDisplayEmptyProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
}

export function DataDisplayEmpty(props: DataDisplayEmptyProps) {
  const {
    title = "No data available",
    description = "There is no data to display at the moment.",
    className,
    children,
    ...rest
  } = props;

  return (
    <div
      data-slot="data-display-empty"
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center",
        className,
      )}
      {...rest}
    >
      <div className="space-y-2">
        <h4 className="font-medium text-muted-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground/80">{description}</p>
      </div>
      {children}
    </div>
  );
}

// Predefined layout components for common patterns
interface KeyValueListProps {
  data: Array<{ key: string; value: React.ReactNode; badge?: boolean }>;
  title?: string;
  className?: string;
}

export function KeyValueList(props: KeyValueListProps) {
  const { data, title, className } = props;

  return (
    <DataDisplayRoot variant="list" className={className}>
      {title && (
        <DataDisplayHeader>
          <DataDisplayTitle>{title}</DataDisplayTitle>
        </DataDisplayHeader>
      )}
      {data.map(({ key, value, badge }, index) => (
        <DataDisplayItem key={key || index}>
          <DataDisplayLabel>{key}</DataDisplayLabel>
          {badge ? (
            <DataDisplayBadge>{value}</DataDisplayBadge>
          ) : (
            <DataDisplayValue>{value}</DataDisplayValue>
          )}
        </DataDisplayItem>
      ))}
    </DataDisplayRoot>
  );
}

interface StatGridProps {
  stats: Array<{
    label: string;
    value: React.ReactNode;
    description?: string;
  }>;
  columns?: number;
  className?: string;
}

export function StatGrid(props: StatGridProps) {
  const { stats, columns = 3, className } = props;

  return (
    <DataDisplayRoot
      variant="grid"
      className={cn(`grid-cols-${columns}`, className)}
    >
      {stats.map(({ label, value, description }, index) => (
        <DataDisplayItem key={label || index}>
          <DataDisplayLabel>{label}</DataDisplayLabel>
          <DataDisplayValue>{value}</DataDisplayValue>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </DataDisplayItem>
      ))}
    </DataDisplayRoot>
  );
}

// Export compound component
export const DataDisplay = {
  Root: DataDisplayRoot,
  Group: DataDisplayGroup,
  Item: DataDisplayItem,
  Label: DataDisplayLabel,
  Value: DataDisplayValue,
  Badge: DataDisplayBadge,
  Separator: DataDisplaySeparator,
  Header: DataDisplayHeader,
  Title: DataDisplayTitle,
  Action: DataDisplayAction,
  Empty: DataDisplayEmpty,
  // Predefined layouts
  KeyValueList,
  StatGrid,
};

// Export types for external use
export type {
  DataDisplayRootProps,
  DataDisplayGroupProps,
  DataDisplayItemProps,
  DataDisplayLabelProps,
  DataDisplayValueProps,
  DataDisplayBadgeProps,
  DataDisplaySeparatorProps,
  DataDisplayHeaderProps,
  DataDisplayTitleProps,
  DataDisplayActionProps,
  DataDisplayEmptyProps,
  KeyValueListProps,
  StatGridProps,
};
