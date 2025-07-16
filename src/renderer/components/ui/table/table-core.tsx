import * as React from "react";
import { cn } from "@/lib/utils";

export function Table(props: React.ComponentProps<"table">) {
  const { className, ...rest } = props;

  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...rest}
      />
    </div>
  );
}

export function TableHeader(props: React.ComponentProps<"thead">) {
  const { className, ...rest } = props;

  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...rest}
    />
  );
}

export function TableBody(props: React.ComponentProps<"tbody">) {
  const { className, ...rest } = props;

  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...rest}
    />
  );
}

export function TableFooter(props: React.ComponentProps<"tfoot">) {
  const { className, ...rest } = props;

  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...rest}
    />
  );
}
