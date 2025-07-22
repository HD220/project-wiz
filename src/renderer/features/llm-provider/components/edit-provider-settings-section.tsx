import { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/renderer/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/renderer/components/ui/form";

import { type ProviderFormData } from "../constants";

interface EditProviderSettingsSectionProps {
  form: UseFormReturn<ProviderFormData>;
}

function EditProviderSettingsSection(props: EditProviderSettingsSectionProps) {
  const { form } = props;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="isDefault"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Set as default provider</FormLabel>
              <p className="text-xs text-muted-foreground">
                This provider will be used by default for new agents
              </p>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Enable this provider</FormLabel>
              <p className="text-xs text-muted-foreground">
                Disabled providers cannot be used by agents
              </p>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}

export { EditProviderSettingsSection };
