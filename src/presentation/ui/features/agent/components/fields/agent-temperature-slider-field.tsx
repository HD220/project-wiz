import React from "react";
import { Control } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";

import type { AgentInstanceFormData } from "../AgentInstanceForm";

interface AgentFormFieldProps {
  control: Control<AgentInstanceFormData>;
}

type AgentTemperatureSliderFieldProps = AgentFormFieldProps;

export function AgentTemperatureSliderField({
  control,
}: AgentTemperatureSliderFieldProps) {
  return (
    <FormField
      control={control}
      name="temperature"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Temperatura</FormLabel>
          <div className="flex items-center gap-4">
            <FormControl>
              <Slider
                min={0}
                max={2}
                step={0.1}
                defaultValue={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
                className="flex-grow"
              />
            </FormControl>
            <span className="text-sm font-mono w-10 text-right">
              {field.value.toFixed(1)}
            </span>
          </div>
          <FormDescription>
            Controla a aleatoriedade das respostas do LLM. Valores mais baixos
            são mais determinísticos. (0.0 - 2.0)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
