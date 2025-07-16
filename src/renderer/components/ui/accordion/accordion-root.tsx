import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";

export function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}
