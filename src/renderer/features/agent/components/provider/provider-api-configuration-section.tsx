import { Key } from "lucide-react"; // Assuming Lucide icon
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import { PROVIDER_CONFIGS } from "@/renderer/features/agent/provider-constants";

import { LlmProviderSchema } from "@/shared/types/llm-provider";

// Schema for form input
const LlmProviderFormSchema = LlmProviderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

interface ProviderApiConfigurationSectionProps {
  watchedType: string;
}

export function ProviderApiConfigurationSection({
  watchedType,
}: ProviderApiConfigurationSectionProps) {
  const form = useFormContext<z.infer<typeof LlmProviderFormSchema>>();

  return (
    <Card className="bg-gradient-to-br from-chart-3/5 via-chart-3/3 to-chart-3/0 border border-border/60">
      <CardHeader className="pb-[var(--spacing-component-md)]">
        <div className="flex items-center gap-[var(--spacing-component-sm)]">
          <Key className="size-5 text-chart-3" />
          <div>
            <CardTitle className="text-lg font-semibold">
              API Configuration
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Configure your API credentials and endpoint settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-[var(--spacing-component-lg)]">
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                API Key
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="sk-proj-..."
                  className="bg-background/50 border-border/60 focus:border-primary/50 transition-colors font-mono"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Your API key will be stored securely and used for authentication
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {PROVIDER_CONFIGS[watchedType as keyof typeof PROVIDER_CONFIGS]
          ?.requiresBaseUrl && (
          <FormField
            control={form.control}
            name="baseUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                  Base URL
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://api.example.com/v1"
                    className="bg-background/50 border-border/60 focus:border-primary/50 transition-colors font-mono"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  Custom API endpoint for your provider
                </FormDescription>
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
              <FormLabel className="text-sm font-semibold">
                Default Model
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="gpt-4o"
                  className="bg-background/50 border-border/60 focus:border-primary/50 transition-colors"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                The default model to use for new agents with this provider
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
