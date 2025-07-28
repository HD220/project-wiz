import { UseFormReturn } from "react-hook-form";
import { Settings, Type, Lock } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";

import { PROVIDER_CONFIGS, type ProviderFormData } from "../constants";

interface EditProviderBasicSectionProps {
  form: UseFormReturn<ProviderFormData>;
}

export function EditProviderBasicSection(props: EditProviderBasicSectionProps) {
  const { form } = props;

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
              Basic provider information and display settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-[var(--spacing-component-lg)]">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                  <Type className="size-4 text-primary" />
                  Provider Type
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled
                >
                  <FormControl>
                    <SelectTrigger className="bg-muted/50 border-border/60 opacity-60">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-muted-foreground flex items-center gap-[var(--spacing-component-xs)]">
                  <Lock className="size-3" />
                  Provider type cannot be changed after creation
                </FormDescription>
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
                    placeholder="My OpenAI Provider"
                    className="bg-background/50 border-border/60 focus:border-primary/50 transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  A friendly name to identify this provider
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
