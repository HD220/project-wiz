import * as SelectPrimitive from "@radix-ui/react-select";
import * as React from "react";
import { cn } from "@/lib/utils";
import { SelectScrollUpButton, SelectScrollDownButton } from "./select-scroll";

export function SelectContent(
  props: React.ComponentProps<typeof SelectPrimitive.Content>,
) {
  const { className, children, position = "popper", ...rest } = props;

  const getPositionClasses = () => {
    if (position === "popper") {
      return "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1";
    }
    return "";
  };

  const getViewportClasses = () => {
    if (position === "popper") {
      return "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1";
    }
    return "";
  };

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          getPositionClasses(),
          className,
        )}
        position={position}
        {...rest}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className={cn("p-1", getViewportClasses())}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}
