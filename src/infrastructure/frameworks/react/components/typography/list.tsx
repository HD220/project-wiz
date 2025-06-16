import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Ul({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    />
  );
}

export function Li({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("my-6", className)}
      {...props}
    />
  );
}
