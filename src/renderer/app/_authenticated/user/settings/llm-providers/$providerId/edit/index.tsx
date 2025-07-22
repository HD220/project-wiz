import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useRouteContext } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { CreateProviderInput } from "@/main/features/agent/llm-provider/llm-provider.types";

import { Button } from "@/renderer/components/ui/button";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import {
  Form,
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
import { TestApiButton } from "@/renderer/features/llm-provider/components/test-api-button";
import { EditProviderBasicSection } from "@/renderer/features/llm-provider/components/edit-provider-basic-section";
import { EditProviderApiSection } from "@/renderer/features/llm-provider/components/edit-provider-api-section";
import { EditProviderSettingsSection } from "@/renderer/features/llm-provider/components/edit-provider-settings-section";
import { EditProviderActionsSection } from "@/renderer/features/llm-provider/components/edit-provider-actions-section";
import {
  PROVIDER_CONFIGS,
  providerFormSchema,
  type ProviderFormData,
} from "@/renderer/features/llm-provider/constants";

function EditProviderModal() {
  const navigate = useNavigate();
  const { providerId } = Route.useParams();
  const { auth } = useRouteContext({ from: "__root__" });
  const router = useRouter();

  // SIMPLE: Get provider from route loader
  const { provider } = Route.useLoaderData();

  // SIMPLE: Direct mutation with window.api
  const updateProviderMutation = useMutation({
    mutationFn: (data: Partial<CreateProviderInput>) =>
      window.api.llmProviders.update(providerId, data),
    onSuccess: () => {
      toast.success("Provider updated successfully");
      router.invalidate(); // Refresh route data
      navigate({ to: "/user/settings/llm-providers" });
    },
    onError: () => {
      toast.error(
        "Failed to update provider. Please check your details and try again.",
      );
    },
  });

  const isLoading = updateProviderMutation.isPending;

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      name: provider?.name || "",
      type: provider?.type || "openai",
      apiKey: provider?.apiKey || "",
      baseUrl: provider?.baseUrl || "",
      defaultModel: provider?.defaultModel || "gpt-4o",
      isDefault: provider?.isDefault || false,
      isActive: provider?.isActive ?? true,
    },
  });

  const watchedType = form.watch("type");
  const watchedApiKey = form.watch("apiKey");

  function onSubmit(data: ProviderFormData) {
    if (!provider || !auth.user?.id) return;

    const updateData = {
      ...data,
      baseUrl: data.baseUrl || null,
    };

    updateProviderMutation.mutate(updateData);
  }

  function handleClose() {
    navigate({ to: "/user/settings/llm-providers" });
  }

  if (!provider) {
    return null;
  }

  const showBaseUrl = PROVIDER_CONFIGS[watchedType].requiresBaseUrl;

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Provider</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <EditProviderBasicSection form={form} />

            <Separator />

            {/* API Configuration */}
            <EditProviderApiSection form={form} watchedType={watchedType} />

            <Separator />

            {/* Settings */}
            <EditProviderSettingsSection form={form} />

            {/* Actions */}
            <EditProviderActionsSection
              form={form}
              watchedType={watchedType}
              watchedApiKey={watchedApiKey}
              isLoading={isLoading}
              onClose={handleClose}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/$providerId/edit/",
)({
  loader: async ({ context, params }) => {
    const auth = context.auth;
    if (!auth.user?.id) {
      throw new Error("User not authenticated");
    }

    const response = await window.api.llmProviders.list(auth.user.id);
    if (!response.success) {
      throw new Error(response.error || "Failed to load providers");
    }
    const provider = response.data?.find((p) => p.id === params.providerId);

    if (!provider) {
      throw new Error("Provider not found");
    }

    return { provider };
  },
  component: EditProviderModal,
});
