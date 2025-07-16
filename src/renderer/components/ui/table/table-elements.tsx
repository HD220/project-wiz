import * as React from "react";
import { cn } from "@/lib/utils";

export function TableRow(props: React.ComponentProps<"tr">) {
  const { className, ...rest } = props;

  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...rest}
    />
  );
}

export function TableHead(props: React.ComponentProps<"th">) {
  const { className, ...rest } = props;

  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...rest}
    />
  );
}

export function TableCell(props: React.ComponentProps<"td">) {
  const { className, ...rest } = props;

  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...rest}
    />
  );
}

export function TableCaption(props: React.ComponentProps<"caption">) {
  const { className, ...rest } = props;

  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...rest}
    />
  );
}
