import { UseFormReturn } from "react-hook-form";

import { AI_DEFAULTS } from "@/main/constants/ai-defaults";
import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

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
import { Separator } from "@/renderer/components/ui/separator";
import type {
  ModelConfig,
  CreateAgentInput,
} from "@/renderer/features/agent/agent.types";

interface AgentProviderSectionProps {
  form: UseFormReturn<CreateAgentInput>;
  providers: LlmProvider[];
}

function AgentProviderSection(props: AgentProviderSectionProps) {
  const { form, providers } = props;

  const activeProviders = providers.filter((provider) => provider.isActive);

  const defaultModelConfig: ModelConfig = {
    model: "gpt-4o",
    temperature: AI_DEFAULTS.TEMPERATURE,
    maxTokens: AI_DEFAULTS.MAX_TOKENS,
    topP: AI_DEFAULTS.TOP_P,
  };

  return (
    <>
      <Separator />

      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="font-medium text-sm">AI Provider Configuration</h4>
          <p className="text-muted-foreground text-xs">
            Choose the AI provider and configure model settings
          </p>
        </div>

        <FormField
          control={form.control}
          name="providerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeProviders.map((provider: any) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                      {provider.isDefault && " (Default)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Model Settings</h4>
            <p className="text-muted-foreground text-xs">
              Configure the AI model parameters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="modelConfig"
              render={({ field }) => {
                const config = field.value
                  ? JSON.parse(field.value)
                  : defaultModelConfig;
                return (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input
                        value={config.model}
                        onChange={(e) => {
                          const newConfig = {
                            ...config,
                            model: e.target.value,
                          };
                          field.onChange(JSON.stringify(newConfig));
                        }}
                        placeholder="gpt-4o"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="modelConfig"
              render={({ field }) => {
                const config = field.value
                  ? JSON.parse(field.value)
                  : defaultModelConfig;
                return (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => {
                          const newConfig = {
                            ...config,
                            temperature: parseFloat(e.target.value),
                          };
                          field.onChange(JSON.stringify(newConfig));
                        }}
                        placeholder="0.7"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="modelConfig"
              render={({ field }) => {
                const config = field.value
                  ? JSON.parse(field.value)
                  : defaultModelConfig;
                return (
                  <FormItem>
                    <FormLabel>Max Tokens</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        value={config.maxTokens}
                        onChange={(e) => {
                          const newConfig = {
                            ...config,
                            maxTokens: parseInt(e.target.value),
                          };
                          field.onChange(JSON.stringify(newConfig));
                        }}
                        placeholder="4000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="modelConfig"
              render={({ field }) => {
                const config = field.value
                  ? JSON.parse(field.value)
                  : defaultModelConfig;
                return (
                  <FormItem>
                    <FormLabel>Top P (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.topP || ""}
                        onChange={(e) => {
                          const newConfig = {
                            ...config,
                            topP: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          };
                          field.onChange(JSON.stringify(newConfig));
                        }}
                        placeholder="0.9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export { AgentProviderSection };
