import { useState } from "react";
import { useController } from "react-hook-form";

import { Button } from "@/renderer/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Textarea } from "@/renderer/components/ui/textarea";

interface JsonFieldProps {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  control: any;
  defaultValue?: any;
}

function JsonField({
  name,
  label,
  description,
  placeholder,
  control,
  defaultValue = {},
}: JsonFieldProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: JSON.stringify(defaultValue, null, 2),
  });

  const [isValid, setIsValid] = useState(true);

  function handleChange(value: string) {
    try {
      JSON.parse(value);
      setIsValid(true);
      field.onChange(value);
    } catch {
      setIsValid(false);
      field.onChange(value);
    }
  }

  function formatJson() {
    try {
      const parsed = JSON.parse(field.value);
      const formatted = JSON.stringify(parsed, null, 2);
      field.onChange(formatted);
    } catch {
      // Keep original value if parsing fails
    }
  }

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <Textarea
            {...field}
            placeholder={placeholder}
            onChange={(e) => handleChange(e.target.value)}
            className={`font-mono text-sm ${!isValid ? "border-destructive" : ""}`}
            rows={8}
          />
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={formatJson}
              disabled={!isValid}
            >
              Format JSON
            </Button>
            {!isValid && (
              <span className="text-sm text-destructive">Invalid JSON</span>
            )}
          </div>
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}

export { JsonField };
