import { useController } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";

interface Provider {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  isDefault?: boolean;
}

interface ProviderSelectFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  control: any;
  providers: Provider[];
  filterActive?: boolean;
}

function ProviderSelectField({
  name,
  label = "LLM Provider",
  description = "Select the language model provider for this agent",
  placeholder = "Select a provider",
  control,
  providers,
  filterActive = true,
}: ProviderSelectFieldProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const availableProviders = filterActive
    ? providers.filter((p) => p.isActive)
    : providers;

  const defaultProvider = availableProviders.find((p) => p.isDefault);

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value || defaultProvider?.id}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {availableProviders.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              <div className="flex items-center justify-between w-full">
                <span>{provider.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {provider.type}
                </span>
                {provider.isDefault && (
                  <span className="text-xs bg-primary/10 text-primary px-1 rounded ml-2">
                    Default
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}

export { ProviderSelectField };
