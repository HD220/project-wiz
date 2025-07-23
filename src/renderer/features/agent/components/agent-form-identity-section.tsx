import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import { Separator } from "@/renderer/components/ui/separator";
import { Textarea } from "@/renderer/components/ui/textarea";

interface AgentIdentitySectionProps {
  form: UseFormReturn<any>;
}

function AgentIdentitySection(props: AgentIdentitySectionProps) {
  const { form } = props;

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="font-medium text-sm">Agent Identity</h4>
          <p className="text-muted-foreground text-xs">
            Define your agent's name, role, and purpose
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent Name *</FormLabel>
                <FormControl>
                  <Input placeholder="My Assistant" {...field} />
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
                <FormLabel>Role *</FormLabel>
                <FormControl>
                  <Input placeholder="Senior Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional avatar image URL for your agent
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="font-medium text-sm">Agent Configuration</h4>
          <p className="text-muted-foreground text-xs">
            Configure your agent's personality and behavior
          </p>
        </div>

        <FormField
          control={form.control}
          name="backstory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backstory *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="You are an experienced software developer with expertise in modern web technologies..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe your agent's background and expertise (10-1000
                characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Help users write clean, maintainable code and solve complex technical problems..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Define your agent's primary goal and objectives (10-500
                characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

export { AgentIdentitySection };
