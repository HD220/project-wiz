 import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react"; // Removed useState, useDebouncedCallback if no longer used directly here
import { Check, Router } from "lucide-react"; // Check might be from PersonaList, Router from Tanstack
import { PersonaList } from "@/components/onboarding/persona-list";
import { UserInfoForm } from "@/components/onboarding/user-info-form";
import { LLMConfigForm } from "@/components/onboarding/llm-config-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { providersQuery, useCore, userQuery } from "@/hooks/use-core";
import { toast } from "sonner";
import { slugfy } from "@/shared/slugfy"; // slugfy is now used in UserInfoForm
import { tryCatch } from "@/shared/tryCatch";
import { AppErrorCode } from "@/lib/error-mapping";
import { Trans } from "@lingui/macro";
import { i18n } from "@lingui/core";
import { SystemText } from "@/components/messages/common";

// type LLMProvider = {
//   id: string | number;
//   name: string;
//   slug: string;
//   models: LLMModel[];
// };

export const Route = createFileRoute("/(public)/onbording/")({
  component: OnbordingPage,
  async beforeLoad() {
    const { data: _data, error } = await tryCatch(userQuery());
    if (error === null) throw redirect({ to: "/user", replace: true });
  },
  async loader() {
    const providers = await providersQuery();
    return {
      providers,
    };
  },
});

function OnbordingPage() {
  return (
    <main className="flex flex-1">
      <ScrollArea className="flex flex-1">
        <div className=" h-screen mx-auto">
          <OnboardingConfig />
        </div>
      </ScrollArea>
    </main>
  );
}

const formSchema = z.object({
  nickname: z.string().min(1),
  email: z.string().min(1).email(),
  username: z.string().min(1),
  avatar: z.string().url(),
  apiKey: z.string().min(32),
  providerId: z.string().uuid(),
  modelId: z.string().uuid(),
  personaId: z.string().optional(),
});

export type FormType = z.infer<typeof formSchema>;

export default function OnboardingConfig() {
  const core = useCore();
  const router = useRouter();

  const { providers } = Route.useLoaderData();
  // const [models, setModels] = useState<LLMModel[]>([]); // Logic moved to LLMConfigForm

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      username: "", // Will be set by UserInfoForm's useEffect
      email: "",
      apiKey: "",
      modelId: "", // Will be handled by LLMConfigForm
      providerId: "", // Will be handled by LLMConfigForm
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=abc`, // Initial, UserInfoForm will update
      personaId: undefined,
    },
  });

  // Nickname, avatar, username logic MOVED to UserInfoForm
  // SelectedProvider, models update logic MOVED to LLMConfigForm

  const handleSubmit = async (data: FormType) => {
    const { data: llmConfig, error: llmConfigError } = await tryCatch(
      core.usecase.createLLMProviderConfig({
        apiKey: data.apiKey,
        llmProviderId: data.providerId,
        modelId: data.modelId,
        name: "default",
      })
    );

    if (llmConfigError) {
      let llmErrorMessage = i18n._(AppErrorCode.UnknownError, "Ocorreu um erro desconhecido ao salvar a configuração do LLM.");
      if (llmConfigError.code === AppErrorCode.LLMProviderConfigSaveFailed) {
        llmErrorMessage = i18n._(AppErrorCode.LLMProviderConfigSaveFailed, "Não foi possível salvar a configuração do provedor LLM. Verifique os dados e tente novamente.");
      }
      // Can add more else if (llmConfigError.code === ...) for other specific codes
      toast.error(llmErrorMessage);
      return;
    }

    const { data: user, error: userError } = await tryCatch(
      core.usecase.createUser({
        user: {
          nickname: data.nickname,
          email: data.email,
          avatarUrl: data.avatar,
        },
        llmProviderConfigId: llmConfig.llmProviderConfigId,
      })
    );

    if (userError) {
      let userErrorMessage = i18n._(AppErrorCode.UnknownError, "Ocorreu um erro desconhecido ao criar o usuário.");
      if (userError.code === AppErrorCode.UserCreateFailed) {
        userErrorMessage = i18n._(AppErrorCode.UserCreateFailed, "Não foi possível criar o usuário. Verifique os dados e tente novamente.");
      } else if (userError.code === AppErrorCode.UserNotFound) { // Example
        userErrorMessage = i18n._(AppErrorCode.UserNotFound, "Usuário não encontrado durante o processo de criação.");
      }
      // Can add more specific error codes here
      toast.error(userErrorMessage);
      return;
    }

    await router.invalidate();

    // console.log("usuário criado com sucesso", user.userId); // Removed console.log
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold"><Trans>Bem-vindo ao <SystemText /> - Sua fabrica de software</Trans></h1>
          <p className="text-muted-foreground mt-2"><Trans>Vamos configurar suas preferências para começar. Você pode alterar
            essas configurações a qualquer momento.</Trans></p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <UserInfoForm control={form.control} watch={form.watch} setValue={form.setValue} />
            <LLMConfigForm control={form.control} watch={form.watch} setValue={form.setValue} providers={providers} />

            <Button type="submit" className="w-full"><Trans>Salvar Configuração</Trans></Button>
          </form>
        </Form>
        <PersonaList onSelectPersona={(id) => form.setValue("personaId", id || undefined)} />
      </div>
    </div>
  );
}
