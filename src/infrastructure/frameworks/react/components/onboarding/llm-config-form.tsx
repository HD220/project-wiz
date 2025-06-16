import { useEffect, useState } from "react";
import { Control, UseFormWatch, UseFormSetValue } from "react-hook-form"; // Corrected import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { llmProvidersPlaceholder, LLMModelPlaceholder } from "@/lib/placeholders"; // To be added to placeholders

// Define the expected part of the form schema this component handles
export type LLMConfigFormValues = {
  apiKey: string;
  providerId: string;
  modelId: string;
};

interface LLMConfigFormProps {
  control: Control<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export function LLMConfigForm({ control, watch, setValue }: LLMConfigFormProps) {
  const [models, setModels] = useState<LLMModelPlaceholder[]>([]);
  const providers = llmProvidersPlaceholder; // Use placeholder
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
        <CardTitle>Configuração do Provedor LLM</CardTitle>
        <CardDescription>
          Configure as definições do seu provedor LLM para alimentar a fabrica.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token da API</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Seu token de API"
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
                <FormLabel>Provedor LLM</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("modelId", ""); // Reset model when provider changes
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o provedor" />
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
                <FormLabel>Modelo LLM</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={models.length === 0} // Disable if no models or no provider selected
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o modelo" />
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
