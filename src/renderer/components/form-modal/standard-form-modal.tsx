import { Loader2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { cn } from "@/renderer/lib/utils";

// Main Modal Container
function StandardFormModal({
  children,
  ...props
}: React.ComponentProps<typeof Dialog>) {
  return <Dialog {...props}>{children}</Dialog>;
}

// Modal Trigger
const StandardFormModalTrigger = DialogTrigger;

// Modal Content - Based on auth pattern with Card structure
function StandardFormModalContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        "max-w-sm lg:max-w-md p-4 lg:p-6",
        "shadow-lg border-border/50 bg-card/95 backdrop-blur-sm",
        "max-h-[90vh] overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col h-full">{children}</div>
    </DialogContent>
  );
}

// Modal Header - Following auth pattern exactly
interface StandardFormModalHeaderProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

function StandardFormModalHeader({
  title,
  description,
  icon: Icon,
  className,
}: StandardFormModalHeaderProps) {
  return (
    <div
      className={cn(
        "text-center transition-colors duration-200 pb-4 flex-shrink-0",
        "space-y-0.5 lg:space-y-1",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        {Icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Icon className="size-4 text-primary" />
          </div>
        )}
        <h3
          className={cn(
            "font-bold leading-tight tracking-tight text-foreground transition-colors duration-200",
            "text-2xl lg:text-3xl",
          )}
        >
          {title}
        </h3>
      </div>
      <p
        className={cn(
          "text-muted-foreground leading-relaxed transition-colors duration-200",
          "text-sm lg:text-base",
        )}
      >
        {description}
      </p>
    </div>
  );
}

// Modal Body - With ScrollArea from shadcn
function StandardFormModalBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-h-0">
      <ScrollArea className={cn("h-full max-h-[60vh]", className)}>
        <div className="space-y-6 p-0 pt-2">{children}</div>
      </ScrollArea>
    </div>
  );
}

// Modal Footer - For actions
function StandardFormModalFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-[var(--spacing-component-sm)] pt-4 px-0 flex-shrink-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Action Buttons Container
function StandardFormModalActions({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Cancel Button
interface StandardFormModalCancelButtonProps
  extends React.ComponentProps<typeof Button> {
  onCancel?: () => void;
}

function StandardFormModalCancelButton({
  className,
  onCancel,
  children = "Cancel",
  ...props
}: StandardFormModalCancelButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("h-10 text-sm font-medium", className)}
      onClick={onCancel}
      {...props}
    >
      {children}
    </Button>
  );
}

// Submit Button
interface StandardFormModalSubmitButtonProps
  extends React.ComponentProps<typeof Button> {
  isSubmitting?: boolean;
  loadingText?: string;
}

function StandardFormModalSubmitButton({
  className,
  isSubmitting = false,
  loadingText = "Saving...",
  children = "Save",
  disabled,
  ...props
}: StandardFormModalSubmitButtonProps) {
  return (
    <Button
      type="submit"
      className={cn(
        "h-10 text-sm font-medium bg-primary hover:bg-primary/90 focus:bg-primary/90",
        "text-primary-foreground transition-all duration-200 hover:shadow-lg hover:shadow-primary/25",
        "hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
        "disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed",
        className,
      )}
      disabled={disabled || isSubmitting}
      {...props}
    >
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isSubmitting ? loadingText : children}
    </Button>
  );
}

export {
  StandardFormModal,
  StandardFormModalActions,
  StandardFormModalBody,
  StandardFormModalCancelButton,
  StandardFormModalContent,
  StandardFormModalFooter,
  StandardFormModalHeader,
  StandardFormModalSubmitButton,
  StandardFormModalTrigger,
};
