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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConversationsStore } from '../store';
import { useAuthStore } from '@/features/auth/store';
import type { Conversation } from '@/lib/types';

const conversationFormSchema = z.object({
  conversation_type: z.enum(['channel', 'dm']),
  name: z.string().optional(),
  description: z.string().optional(),
  project_id: z.string().optional(),
});

type ConversationFormData = z.infer<typeof conversationFormSchema>;

type ConversationFormProps = {
  conversation?: Conversation;
  onSuccess?: (conversation: Conversation) => void;
  onCancel?: () => void;
};

export function ConversationForm({
  conversation,
  onSuccess,
  onCancel,
}: ConversationFormProps) {
  const { token } = useAuthStore();
  const { createConversation, updateConversation, isLoading } =
    useConversationsStore();

  const form = useForm<ConversationFormData>({
    resolver: zodResolver(conversationFormSchema),
    defaultValues: conversation
      ? {
          conversation_type: conversation.conversation_type as 'channel' | 'dm',
          name: conversation.name || '',
          description: conversation.description || '',
          project_id: conversation.project_id || '',
        }
      : {
          conversation_type: 'channel',
          name: '',
          description: '',
          project_id: '',
        },
  });

  const conversationType = form.watch('conversation_type');

  const handleSubmit = async (data: ConversationFormData) => {
    if (!token) return;

    try {
      const result = conversation
        ? await updateConversation(
            {
              id: conversation.id,
              name: data.name || undefined,
              description: data.description || undefined,
            },
            token
          )
        : await createConversation(
            {
              conversation_type: data.conversation_type,
              name: data.name || undefined,
              description: data.description || undefined,
              project_id: data.project_id || undefined,
            },
            token
          );

      form.reset();
      onSuccess?.(result);
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="conversation_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!conversation}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select conversation type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="channel">Channel</SelectItem>
                  <SelectItem value="dm">Direct Message</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Channels are for project discussions, DMs are for direct messages
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {conversationType === 'channel' && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel Name</FormLabel>
                <FormControl>
                  <Input placeholder="general" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the purpose of this conversation..."
                  {...field}
                />
              </FormControl>
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
            {isLoading
              ? 'Saving...'
              : conversation
              ? 'Update Conversation'
              : 'Create Conversation'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
