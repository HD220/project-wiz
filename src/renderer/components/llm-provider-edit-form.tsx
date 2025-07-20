import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ProviderType = "openai" | "deepseek" | "anthropic";

import { useLlmProviderStore } from "@/renderer/store/llm-provider-store";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1, "Provider name is required"),
  type: z.enum(["openai", "deepseek", "anthropic"]),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface LlmProvider {
  id: string;
  userId: string;
  name: string;
  type: "openai" | "deepseek" | "anthropic";
  apiKey: string;
  baseUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LlmProviderEditFormProps {
  provider: LlmProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LlmProviderEditForm({
  provider,
  isOpen,
  onClose,
  onSuccess,
}: LlmProviderEditFormProps) {
  const { updateProvider, testApiKey, isLoading, error, clearError } =
    useLlmProviderStore();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    message: string;
    model?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "openai",
      apiKey: "",
      baseUrl: "",
      isDefault: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (provider && isOpen) {
      form.reset({
        name: provider.name,
        type: provider.type,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl || "",
        isDefault: provider.isDefault,
        isActive: provider.isActive,
      });
      setTestResult(null);
    }
  }, [provider, isOpen, form]);

  const handleSubmit = async (data: FormData) => {
    if (!provider) return;

    setSubmitError(null);
    clearError();

    try {
      const input = {
        userId: provider.userId,
        name: data.name,
        type: data.type as ProviderType,
        apiKey: data.apiKey,
        baseUrl: data.baseUrl || null,
        isDefault: data.isDefault,
        isActive: data.isActive,
      };

      await updateProvider(provider.id, input);
      onSuccess?.();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update provider",
      );
    }
  };

  const handleTestApiKey = async () => {
    const type = form.getValues("type");
    const apiKey = form.getValues("apiKey");
    const baseUrl = form.getValues("baseUrl");

    if (!apiKey.trim()) {
      setTestResult({
        valid: false,
        message: "Please enter an API key first",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testApiKey(
        type as ProviderType,
        apiKey,
        baseUrl || undefined,
      );
      setTestResult(result);
    } catch (error) {
      setTestResult({
        valid: false,
        message: error instanceof Error ? error.message : "Test failed",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSubmitError(null);
    setTestResult(null);
    clearError();
    onClose();
  };

  const providerOptions = [
    { value: "openai", label: "OpenAI" },
    { value: "deepseek", label: "DeepSeek" },
    { value: "anthropic", label: "Anthropic" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Provider</DialogTitle>
          <DialogDescription>
            Update your LLM provider configuration.
          </DialogDescription>
        </DialogHeader>

        {(error || submitError) && (
          <Alert variant="destructive">
            <AlertDescription>{error || submitError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My OpenAI Account" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this provider.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providerOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the LLM provider you want to connect.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="password" placeholder="sk-..." {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestApiKey}
                      disabled={isTesting || isLoading}
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        "Test"
                      )}
                    </Button>
                  </div>
                  <FormDescription>
                    Your API key will be encrypted and stored securely.
                  </FormDescription>
                  {testResult && (
                    <div
                      className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                        testResult.valid
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {testResult.valid ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.openai.com/v1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Custom API endpoint URL. Leave empty to use default.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-6">
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Set as Default</FormLabel>
                      <FormDescription>
                        Use this provider as the default for new agents.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Enable this provider for use.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Provider"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
