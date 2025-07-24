import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { CreateProviderInput } from "@/main/features/agent/llm-provider/llm-provider.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { Form } from "@/renderer/components/ui/form";
import { Separator } from "@/renderer/components/ui/separator";
import { EditProviderActionsSection } from "@/renderer/features/llm-provider/components/edit-provider-actions-section";
import { EditProviderApiSection } from "@/renderer/features/llm-provider/components/edit-provider-api-section";
import { EditProviderBasicSection } from "@/renderer/features/llm-provider/components/edit-provider-basic-section";
import { EditProviderSettingsSection } from "@/renderer/features/llm-provider/components/edit-provider-settings-section";
import {
  providerFormSchema,
  type ProviderFormData,
} from "@/renderer/features/llm-provider/constants";

function EditProviderModal() {
  const navigate = useNavigate();
  const { providerId } = Route.useParams();
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

  function onSubmit(data: ProviderFormData) {
    if (!provider) return;

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
            <EditProviderApiSection
              form={form}
              watchedType={watchedType as any}
            />

            <Separator />

            {/* Settings */}
            <EditProviderSettingsSection form={form} />

            {/* Actions */}
            <EditProviderActionsSection
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
    const { auth } = context;

    const response = await window.api.llmProviders.list(auth.user!.id);
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
