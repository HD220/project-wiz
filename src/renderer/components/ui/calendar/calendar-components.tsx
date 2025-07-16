import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export function CalendarRoot({ className, rootRef, ...props }) {
  return (
    <div
      data-slot="calendar"
      ref={rootRef}
      className={cn(className)}
      {...props}
    />
  );
}

export function CalendarChevron({ className, orientation, ...props }) {
  if (orientation === "left") {
    return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
  }

  if (orientation === "right") {
    return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
  }

  return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
}

export function CalendarWeekNumber({ children, ...props }) {
  return (
    <td {...props}>
      <div className="flex size-(--cell-size) items-center justify-center text-center">
        {children}
      </div>
    </td>
  );
}
