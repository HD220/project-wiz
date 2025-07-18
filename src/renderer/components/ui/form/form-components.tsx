import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { FormItemContext, useFormField } from "./form-context";

export function FormItem(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...rest}
      />
    </FormItemContext.Provider>
  );
}

export function FormLabel(
  props: React.ComponentProps<typeof LabelPrimitive.Root>,
) {
  const { className, ...rest } = props;
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...rest}
    />
  );
}

export function FormControl(props: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  const getAriaDescribedBy = () => {
    if (!error) {
      return formDescriptionId;
    }
    return `${formDescriptionId} ${formMessageId}`;
  };

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={getAriaDescribedBy()}
      aria-invalid={!!error}
      {...props}
    />
  );
}

export function FormDescription(props: React.ComponentProps<"p">) {
  const { className, ...rest } = props;
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...rest}
    />
  );
}

export function FormMessage(props: React.ComponentProps<"p">) {
  const { className, ...rest } = props;
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...rest}
    >
      {body}
    </p>
  );
}
