import { AlertCircle, CheckCircle2, Shield } from "lucide-react"; // Assuming Lucide icons
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/renderer/components/ui/form";
import { cn } from "@/renderer/lib/utils";

import { LlmProviderSchema } from "@/shared/types/llm-provider";

// Schema for form input
const _LlmProviderFormSchema = LlmProviderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export function ProviderSettingsSection() {
  const form = useFormContext<z.infer<typeof _LlmProviderFormSchema>>();

  return (
    <Card className="bg-gradient-to-br from-chart-4/5 via-chart-4/3 to-chart-4/0 border border-border/60">
      <CardHeader className="pb-[var(--spacing-component-md)]">
        <div className="flex items-center gap-[var(--spacing-component-sm)]">
          <Shield className="size-5 text-chart-4" />
          <div>
            <CardTitle className="text-lg font-semibold">
              Provider Settings
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Configure provider behavior and default status
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-[var(--spacing-component-lg)]">
        <div className="grid gap-[var(--spacing-component-lg)]">
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex flex-row items-center justify-between rounded-lg border p-[var(--spacing-component-md)] transition-colors",
                  "bg-background/30 border-border/60 hover:bg-background/50",
                  field.value && "bg-primary/5 border-primary/20",
                )}
              >
                <div className="space-y-[var(--spacing-component-xs)]">
                  <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                    <CheckCircle2 className="size-4 text-chart-4" />
                    Default Provider
                  </FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    Use this provider by default for new agents
                  </FormDescription>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deactivatedAt"
            render={({ field }) => {
              const isActive = !field.value;
              return (
                <FormItem
                  className={cn(
                    "flex flex-row items-center justify-between rounded-lg border p-[var(--spacing-component-md)] transition-colors",
                    "bg-background/30 border-border/60 hover:bg-background/50",
                    isActive && "bg-chart-2/5 border-chart-2/20",
                  )}
                >
                  <div className="space-y-[var(--spacing-component-xs)]">
                    <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                      <AlertCircle className="size-4 text-chart-2" />
                      Active Provider
                    </FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      Enable this provider for use in agents
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={isActive}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? null : new Date())
                      }
                      className="data-[state=checked]:bg-chart-2 data-[state=checked]:border-chart-2"
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
