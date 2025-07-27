import { createContext, useContext } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/renderer/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/renderer/components/ui/card";

// Context for compound component communication
interface FeatureCardContextValue {
  variant: "default" | "highlighted" | "compact";
  interactive: boolean;
}

const FeatureCardContext = createContext<FeatureCardContextValue | null>(null);

function useFeatureCardContext() {
  const context = useContext(FeatureCardContext);
  if (!context) {
    throw new Error(
      "FeatureCard components must be used within FeatureCard.Root",
    );
  }
  return context;
}

// Root component variants
const featureCardVariants = cva("transition-all duration-200 group", {
  variants: {
    variant: {
      default: "hover:shadow-md",
      highlighted:
        "border-primary/50 bg-primary/5 hover:bg-primary/10 hover:shadow-lg",
      compact: "hover:shadow-sm",
    },
    interactive: {
      true: "cursor-pointer hover:scale-[1.02]",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    interactive: false,
  },
});

// Root component
interface FeatureCardRootProps
  extends React.ComponentProps<typeof Card>,
    VariantProps<typeof featureCardVariants> {
  interactive?: boolean;
}

function FeatureCardRoot(props: FeatureCardRootProps) {
  const {
    variant = "default",
    interactive = false,
    className,
    children,
    ...rest
  } = props;

  return (
    <FeatureCardContext.Provider
      value={{ variant: variant || "default", interactive }}
    >
      <Card
        data-slot="feature-card"
        className={cn(featureCardVariants({ variant, interactive }), className)}
        {...rest}
      >
        {children}
      </Card>
    </FeatureCardContext.Provider>
  );
}

// Header component with variants based on context
const headerVariants = cva("transition-colors duration-200", {
  variants: {
    variant: {
      default: "",
      highlighted: "group-hover:text-primary",
      compact: "pb-2",
    },
  },
});

interface FeatureCardHeaderProps
  extends React.ComponentProps<typeof CardHeader> {}

function FeatureCardHeader(props: FeatureCardHeaderProps) {
  const { className, children, ...rest } = props;
  const { variant } = useFeatureCardContext();

  return (
    <CardHeader
      data-slot="feature-card-header"
      className={cn(headerVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </CardHeader>
  );
}

// Title component
const titleVariants = cva("font-semibold transition-colors duration-200", {
  variants: {
    variant: {
      default: "text-base",
      highlighted: "text-lg group-hover:text-primary",
      compact: "text-sm",
    },
  },
});

interface FeatureCardTitleProps extends React.ComponentProps<"h3"> {
  asChild?: boolean;
}

function FeatureCardTitle(props: FeatureCardTitleProps) {
  const { className, asChild = false, children, ...rest } = props;
  const { variant } = useFeatureCardContext();
  const Comp = asChild ? Slot : "h3";

  return (
    <Comp
      data-slot="feature-card-title"
      className={cn(titleVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Description component
const descriptionVariants = cva(
  "text-muted-foreground transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "text-sm",
        highlighted: "text-sm group-hover:text-muted-foreground/80",
        compact: "text-xs line-clamp-2",
      },
    },
  },
);

interface FeatureCardDescriptionProps extends React.ComponentProps<"p"> {
  asChild?: boolean;
}

function FeatureCardDescription(props: FeatureCardDescriptionProps) {
  const { className, asChild = false, children, ...rest } = props;
  const { variant } = useFeatureCardContext();
  const Comp = asChild ? Slot : "p";

  return (
    <Comp
      data-slot="feature-card-description"
      className={cn(descriptionVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Icon component
interface FeatureCardIconProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function FeatureCardIcon(props: FeatureCardIconProps) {
  const { className, asChild = false, children, ...rest } = props;
  const { variant, interactive } = useFeatureCardContext();
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="feature-card-icon"
      className={cn(
        "flex items-center justify-center rounded-lg transition-all duration-200",
        {
          "h-10 w-10 bg-primary/10 text-primary group-hover:bg-primary/20":
            variant === "default",
          "h-12 w-12 bg-primary text-primary-foreground group-hover:bg-primary/90":
            variant === "highlighted",
          "h-8 w-8 bg-muted text-muted-foreground": variant === "compact",
          "group-hover:scale-110": interactive,
        },
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Content component
interface FeatureCardContentProps
  extends React.ComponentProps<typeof CardContent> {}

function FeatureCardContent(props: FeatureCardContentProps) {
  const { className, children, ...rest } = props;
  const { variant } = useFeatureCardContext();

  return (
    <CardContent
      data-slot="feature-card-content"
      className={cn(
        {
          "space-y-3": variant !== "compact",
          "space-y-2": variant === "compact",
        },
        className,
      )}
      {...rest}
    >
      {children}
    </CardContent>
  );
}

// Footer component
interface FeatureCardFooterProps
  extends React.ComponentProps<typeof CardFooter> {}

function FeatureCardFooter(props: FeatureCardFooterProps) {
  const { className, children, ...rest } = props;

  return (
    <CardFooter
      data-slot="feature-card-footer"
      className={cn("flex items-center justify-between", className)}
      {...rest}
    >
      {children}
    </CardFooter>
  );
}

// Action component
interface FeatureCardActionProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function FeatureCardAction(props: FeatureCardActionProps) {
  const { className, asChild = false, children, ...rest } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="feature-card-action"
      className={cn("flex items-center gap-2", className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Meta component for additional information
interface FeatureCardMetaProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function FeatureCardMeta(props: FeatureCardMetaProps) {
  const { className, asChild = false, children, ...rest } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="feature-card-meta"
      className={cn("text-xs text-muted-foreground", className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Export compound component
export const FeatureCard = {
  Root: FeatureCardRoot,
  Header: FeatureCardHeader,
  Title: FeatureCardTitle,
  Description: FeatureCardDescription,
  Icon: FeatureCardIcon,
  Content: FeatureCardContent,
  Footer: FeatureCardFooter,
  Action: FeatureCardAction,
  Meta: FeatureCardMeta,
};

// Export types for external use
export type {
  FeatureCardRootProps,
  FeatureCardHeaderProps,
  FeatureCardTitleProps,
  FeatureCardDescriptionProps,
  FeatureCardIconProps,
  FeatureCardContentProps,
  FeatureCardFooterProps,
  FeatureCardActionProps,
  FeatureCardMetaProps,
};
