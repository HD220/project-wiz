import { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/renderer/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/renderer/components/ui/form";
import { Separator } from "@/renderer/components/ui/separator";

interface ProviderSettingsSectionProps {
  form: UseFormReturn<any>;
}

function ProviderSettingsSection(props: ProviderSettingsSectionProps) {
  const { form } = props;

  return (
    <>
      <Separator />

      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="font-medium text-sm">Provider Settings</h4>
          <p className="text-muted-foreground text-xs">
            Configure provider behavior and status
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium">
                    Default Provider
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Use this provider by default for new agents
                  </p>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium">
                    Active Provider
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Enable this provider for use in agents
                  </p>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
}

export { ProviderSettingsSection };
