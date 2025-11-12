import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProvidersStore } from '../store';
import { useAuthStore } from '@/features/auth/store';
import type { LlmProvider } from '@/lib/types';

const providerFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  provider_type: z.enum(['openai', 'anthropic', 'google', 'deepseek', 'custom']),
  api_key: z.string().min(1, 'API key is required'),
  base_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_default: z.boolean(),
});

type ProviderFormData = z.infer<typeof providerFormSchema>;

type ProviderFormProps = {
  provider?: LlmProvider;
  onSuccess?: (provider: LlmProvider) => void;
  onCancel?: () => void;
};

export function ProviderForm({
  provider,
  onSuccess,
  onCancel,
}: ProviderFormProps) {
  const { token } = useAuthStore();
  const { createProvider, updateProvider, isLoading } = useProvidersStore();

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: provider
      ? {
          name: provider.name,
          provider_type: provider.provider_type as any,
          api_key: '', // Don't show existing API key
          base_url: provider.base_url ?? '',
          is_default: provider.is_default === 1,
        }
      : {
          name: '',
          provider_type: 'openai',
          api_key: '',
          base_url: '',
          is_default: false,
        },
  });

  const handleSubmit = async (data: ProviderFormData) => {
    if (!token) return;

    try {
      // Convert empty string to undefined for base_url
      const baseUrl = data.base_url === '' ? undefined : data.base_url;

      const result = provider
        ? await updateProvider(
            {
              id: provider.id,
              name: data.name,
              base_url: baseUrl,
              is_default: data.is_default,
            },
            token
          )
        : await createProvider(
            {
              name: data.name,
              provider_type: data.provider_type,
              api_key: data.api_key,
              base_url: baseUrl,
              is_default: data.is_default,
            },
            token
          );

      form.reset();
      onSuccess?.(result);
    } catch (error) {
      console.error('Failed to save provider:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My OpenAI Provider" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!provider && (
          <FormField
            control={form.control}
            name="provider_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type of LLM provider (cannot be changed after creation)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!provider && (
          <FormField
            control={form.control}
            name="api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Your API key will be encrypted and stored securely
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="base_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://api.openai.com/v1"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Custom API endpoint (leave empty for default)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Set as default provider</FormLabel>
                <FormDescription>
                  This provider will be used as the default for new agents
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : provider
              ? 'Update Provider'
              : 'Create Provider'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
