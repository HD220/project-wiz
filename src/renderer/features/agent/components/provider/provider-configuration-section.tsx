import { Settings } from "lucide-react"; // Assuming Lucide icon
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { PROVIDER_CONFIGS } from "@/renderer/features/agent/provider-constants";

import { LlmProviderSchema } from "@/shared/types/llm-provider";

// Schema for form input
const LlmProviderFormSchema = LlmProviderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

interface ProviderConfigurationSectionProps {
  isEditing: boolean;
}

export function ProviderConfigurationSection({
  isEditing,
}: ProviderConfigurationSectionProps) {
  const form = useFormContext<z.infer<typeof LlmProviderFormSchema>>();

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/0 border border-border/60">
      <CardHeader className="pb-[var(--spacing-component-md)]">
        <div className="flex items-center gap-[var(--spacing-component-sm)]">
          <Settings className="size-5 text-primary" />
          <div>
            <CardTitle className="text-lg font-semibold">
              Provider Configuration
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Choose your AI provider and give it a name
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-[var(--spacing-component-lg)]">
        <div className="grid grid-cols-2 gap-[var(--spacing-component-lg)]">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                  Provider Type
                  <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isEditing}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background/50 border-border/60 focus:border-primary/50 transition-colors">
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card/95 backdrop-blur-sm border border-border/60">
                    {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="focus:bg-accent/50"
                      >
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                  Display Name
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="My AI Provider"
                    className="bg-background/50 border-border/60 focus:border-primary/50 transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
