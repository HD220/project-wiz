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
import { useAgentsStore } from '../store';
import { useAuthStore } from '@/features/auth/store';
import type { Agent } from '@/lib/types';

const agentFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  role: z.string().min(1, 'Role is required').max(100, 'Role is too long'),
  backstory: z.string().min(1, 'Backstory is required'),
  goal: z.string().min(1, 'Goal is required'),
  llm_provider_id: z.string().min(1, 'Provider is required'),
  model: z.string().min(1, 'Model is required'),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(1).max(100000),
  top_p: z.number().min(0).max(1).optional(),
});

type AgentFormData = z.infer<typeof agentFormSchema>;

type AgentFormProps = {
  agent?: Agent;
  onSuccess?: (agent: Agent) => void;
  onCancel?: () => void;
};

export function AgentForm({ agent, onSuccess, onCancel }: AgentFormProps) {
  const { token } = useAuthStore();
  const { createAgent, updateAgent, isLoading } = useAgentsStore();

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: agent
      ? {
          name: agent.user.name,
          role: agent.config.role,
          backstory: agent.config.backstory,
          goal: agent.config.goal,
          llm_provider_id: agent.config.llm_provider_id,
          model: agent.config.model,
          temperature: agent.config.temperature,
          max_tokens: agent.config.max_tokens,
          top_p: agent.config.top_p ?? undefined,
        }
      : {
          name: '',
          role: '',
          backstory: '',
          goal: '',
          llm_provider_id: '',
          model: '',
          temperature: 0.7,
          max_tokens: 2000,
          top_p: undefined,
        },
  });

  const handleSubmit = async (data: AgentFormData) => {
    if (!token) return;

    try {
      const result = agent
        ? await updateAgent({ id: agent.user.id, ...data }, token)
        : await createAgent(data, token);

      form.reset();
      onSuccess?.(result);
    } catch (error) {
      console.error('Failed to save agent:', error);
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
                <Input placeholder="Agent name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Senior Developer, Code Reviewer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What is this agent's primary objective?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="backstory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backstory</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Agent's background and expertise"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide context about the agent's expertise and experience
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="llm_provider_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LLM Provider</FormLabel>
              <FormControl>
                <Input placeholder="Provider ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="e.g., gpt-4, claude-3-opus" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_tokens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Tokens</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="top_p"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Top P (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseFloat(value) : undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : agent ? 'Update Agent' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
