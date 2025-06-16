import { cn } from "@/lib/utils";

export function TableContainer({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <div className={cn("my-6 w-full overflow-y-auto", className)} {...props} />
  );
}

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <table className={cn("w-full", className)} {...props} />;
}

export function THead({ ...props }: React.ComponentProps<"thead">) {
  return <thead {...props} />;
}

export function Tr({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn("m-0 border-t p-0 even:bg-muted", className)}
      {...props}
    />
  );
}

export function Th({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  );
}

export function TBody({ ...props }: React.ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

export function Td({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  );
}
