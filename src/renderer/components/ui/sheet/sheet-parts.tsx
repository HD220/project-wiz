import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "@/lib/utils";

export function SheetHeader(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;

  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...rest}
    />
  );
}

export function SheetFooter(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;

  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...rest}
    />
  );
}

export function SheetTitle(
  props: React.ComponentProps<typeof SheetPrimitive.Title>,
) {
  const { className, ...rest } = props;

  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...rest}
    />
  );
}

export function SheetDescription(
  props: React.ComponentProps<typeof SheetPrimitive.Description>,
) {
  const { className, ...rest } = props;

  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...rest}
    />
  );
}
