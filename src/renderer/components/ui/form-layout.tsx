import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { cn } from "@/renderer/lib/utils";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";

function FormLayout({ className, ...props }: React.ComponentProps<"form">) {
  return (
    <form
      data-slot="form-layout"
      className={cn("space-y-6", className)}
      {...props}
    />
  );
}

function FormCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card data-slot="form-card" className={cn("", className)} {...props} />
  );
}

function FormCardHeader({
  className,
  ...props
}: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader
      data-slot="form-card-header"
      className={cn("space-y-2", className)}
      {...props}
    />
  );
}

function FormCardTitle({
  className,
  ...props
}: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle
      data-slot="form-card-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

function FormCardDescription({
  className,
  ...props
}: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription
      data-slot="form-card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormCardContent({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      data-slot="form-card-content"
      className={cn("space-y-6", className)}
      {...props}
    />
  );
}

function FormSection({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-section"
      className={cn("space-y-4", className)}
      {...props}
    />
  );
}

function FormSectionHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-section-header"
      className={cn("space-y-1", className)}
      {...props}
    />
  );
}

function FormSectionTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="form-section-title"
      className={cn("text-base font-medium leading-none", className)}
      {...props}
    />
  );
}

function FormSectionDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="form-section-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-actions"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

interface FormCancelButtonProps extends React.ComponentProps<typeof Button> {
  onCancel?: () => void;
}

function FormCancelButton({
  className,
  onCancel,
  children = "Cancel",
  ...props
}: FormCancelButtonProps) {
  return (
    <Button
      data-slot="form-cancel-button"
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

interface FormSubmitButtonProps extends React.ComponentProps<typeof Button> {
  isSubmitting?: boolean;
  loadingText?: string;
}

function FormSubmitButton({
  className,
  isSubmitting = false,
  loadingText = "Saving...",
  children = "Save",
  disabled,
  ...props
}: FormSubmitButtonProps) {
  return (
    <Button
      data-slot="form-submit-button"
      type="submit"
      className={cn("", className)}
      disabled={disabled || isSubmitting}
      {...props}
    >
      {isSubmitting && (
        <Loader2Icon data-slot="loading-icon" className="animate-spin" />
      )}
      {isSubmitting ? loadingText : children}
    </Button>
  );
}

export {
  FormActions,
  FormCancelButton,
  FormCard,
  FormCardContent,
  FormCardDescription,
  FormCardHeader,
  FormCardTitle,
  FormLayout,
  FormSection,
  FormSectionDescription,
  FormSectionHeader,
  FormSectionTitle,
  FormSubmitButton,
};
