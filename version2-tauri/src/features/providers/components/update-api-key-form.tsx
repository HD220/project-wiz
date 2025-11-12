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
import { useProvidersStore } from '../store';
import { useAuthStore } from '@/features/auth/store';

const updateApiKeySchema = z.object({
  api_key: z.string().min(1, 'API key is required'),
});

type UpdateApiKeyFormData = z.infer<typeof updateApiKeySchema>;

type UpdateApiKeyFormProps = {
  providerId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function UpdateApiKeyForm({
  providerId,
  onSuccess,
  onCancel,
}: UpdateApiKeyFormProps) {
  const { token } = useAuthStore();
  const { updateProviderApiKey, isLoading } = useProvidersStore();

  const form = useForm<UpdateApiKeyFormData>({
    resolver: zodResolver(updateApiKeySchema),
    defaultValues: {
      api_key: '',
    },
  });

  const handleSubmit = async (data: UpdateApiKeyFormData) => {
    if (!token) return;

    try {
      await updateProviderApiKey(
        { id: providerId, api_key: data.api_key },
        token
      );
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update API key:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="api_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New API Key</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="sk-..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your new API key will be encrypted and stored securely
              </FormDescription>
              <FormMessage />
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
            {isLoading ? 'Updating...' : 'Update API Key'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
