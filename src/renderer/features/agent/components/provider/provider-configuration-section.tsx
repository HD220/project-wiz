import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/molecules/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/atoms/form";
import { Input } from "@/renderer/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/atoms/select";
import { PROVIDER_CONFIGS } from "@/renderer/features/agent/provider-constants";
import { Settings } from "lucide-react"; // Assuming Lucide icon
import { useFormContext } from "react-hook-form";
import { LlmProviderFormSchema } from "../../agent.schema";
import { z } from "zod";

interface ProviderConfigurationSectionProps {
  isEditing: boolean;
  watchedType: string;
}

export function ProviderConfigurationSection({
  isEditing,
  watchedType,
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
                      <SelectItem key={key} value={key} className="focus:bg-accent/50">
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
