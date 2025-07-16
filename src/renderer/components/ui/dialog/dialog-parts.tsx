import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "@/lib/utils";

export function DialogHeader(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;

  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...rest}
    />
  );
}

export function DialogFooter(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;

  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...rest}
    />
  );
}

export function DialogTitle(
  props: React.ComponentProps<typeof DialogPrimitive.Title>,
) {
  const { className, ...rest } = props;

  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...rest}
    />
  );
}

export function DialogDescription(
  props: React.ComponentProps<typeof DialogPrimitive.Description>,
) {
  const { className, ...rest } = props;

  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...rest}
    />
  );
}
