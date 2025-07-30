import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent, CardHeader } from "@/renderer/components/ui/card";
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
        "max-w-sm lg:max-w-md p-6 lg:p-8",
        "shadow-lg border-border/50 bg-card/95 backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      <Card className="w-full mx-auto transition-all duration-200 hover:shadow-md p-0 border-0 shadow-none bg-transparent">
        {children}
      </Card>
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
    <CardHeader
      className={cn(
        "text-center transition-colors duration-200 p-0",
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
    </CardHeader>
  );
}

// Modal Body - With ScrollArea from shadcn
function StandardFormModalBody({
  className,
  children,
  maxHeight = "60vh",
  ...props
}: React.ComponentProps<"div"> & { maxHeight?: string }) {
  return (
    <CardContent className="p-0">
      <ScrollArea
        className={cn(
          "max-h-[60vh]",
          maxHeight !== "60vh" && `max-h-[${maxHeight}]`,
          className,
        )}
      >
        <div className="space-y-6 pr-4" {...props}>
          {children}
        </div>
      </ScrollArea>
    </CardContent>
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
        "flex flex-col space-y-[var(--spacing-component-sm)] pt-6",
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
      className={cn("", className)}
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
        "w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 focus:bg-primary/90",
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
