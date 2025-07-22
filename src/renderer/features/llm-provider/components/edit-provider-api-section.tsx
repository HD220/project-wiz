import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";

import { PROVIDER_CONFIGS, type ProviderFormData } from "../constants";

interface EditProviderApiSectionProps {
  form: UseFormReturn<ProviderFormData>;
  watchedType: string;
}

function EditProviderApiSection(props: EditProviderApiSectionProps) {
  const { form, watchedType } = props;

  const showBaseUrl =
    PROVIDER_CONFIGS[watchedType as keyof typeof PROVIDER_CONFIGS]
      .requiresBaseUrl;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="apiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>API Key</FormLabel>
            <FormControl>
              <Input type="password" placeholder="sk-proj-..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {showBaseUrl && (
        <FormField
          control={form.control}
          name="baseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base URL</FormLabel>
              <FormControl>
                <Input placeholder="https://api.example.com/v1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="defaultModel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Default Model</FormLabel>
            <FormControl>
              <Input placeholder="gpt-4o" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export { EditProviderApiSection };
