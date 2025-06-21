import { useEffect, useState } from "react";
import { Control, UseFormWatch, UseFormSetValue } from "react-hook-form"; // Corrected import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { llmProvidersPlaceholder, type LLMModelPlaceholder, type LLMProviderPlaceholder } from "@/infrastructure/frameworks/react/lib/placeholders";
import type { FormType } from "@/pages/(public)/onbording/index";
import { Trans, t } from "@lingui/macro";

// Define the expected part of the form schema this component handles
export type LLMConfigFormValues = {
  apiKey: string;
  providerId: string;
  modelId: string;
};

interface LLMConfigFormProps {
  control: Control<Pick<FormType, 'apiKey' | 'providerId' | 'modelId'>>;
  watch: UseFormWatch<Pick<FormType, 'apiKey' | 'providerId' | 'modelId'>>;
  setValue: UseFormSetValue<Pick<FormType, 'apiKey' | 'providerId' | 'modelId'>>;
  providers?: LLMProviderPlaceholder[];
}

export function LLMConfigForm({ control, watch, setValue, providers: liveProviders = llmProvidersPlaceholder }: LLMConfigFormProps) {
  const [models, setModels] = useState<LLMModelPlaceholder[]>([]);
  const providers = liveProviders; // Use liveProviders or fallback to placeholder
  const selectedProvider = watch("providerId");

  useEffect(() => {
    const currentProviderData = providers.find(
      (provider) => provider.id === selectedProvider
    );
    setModels(currentProviderData ? currentProviderData.models : []);
    // Optionally reset modelId if the selected provider changes and the current modelId is not valid for the new provider
    // setValue("modelId", "");
  }, [selectedProvider, providers, setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle><Trans>Configuração do Provedor LLM</Trans></CardTitle>
        <CardDescription><Trans>Configure as definições do seu provedor LLM para alimentar a fabrica.</Trans></CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel><Trans>Token da API</Trans></FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t`Seu token de API`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="providerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel><Trans>Provedor LLM</Trans></FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("modelId", ""); // Reset model when provider changes
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t`Selecione o provedor`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem
                        key={provider.id}
                        value={provider.id}
                      >
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="modelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel><Trans>Modelo LLM</Trans></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={models.length === 0} // Disable if no models or no provider selected
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t`Selecione o modelo`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
