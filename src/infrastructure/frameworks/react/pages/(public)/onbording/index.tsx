import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
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
import { slugfy } from "@/shared/slugfy";
import { tryCatch } from "@/shared/tryCatch";

type LLMModel = {
  id: string | number;
  name: string;
  slug: string;
};

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
});

type FormType = z.infer<typeof formSchema>;

export default function OnboardingConfig() {
  const core = useCore();
  const router = useRouter();

  const { providers } = Route.useLoaderData();
  const [models, setModels] = useState<LLMModel[]>([]);
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      username: "",
      email: "",
      apiKey: "",
      modelId: "",
      providerId: "",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=abc`,
    },
  });

  const nickname = form.watch("nickname");
  const avatarDebounced = useDebouncedCallback(() => {
    form.setValue(
      "avatar",
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`
    );
  }, 200);
  useEffect(() => {
    form.setValue("username", slugfy(`${nickname}`));
  }, [nickname]);

  avatarDebounced();
  const selectedProvider = form.watch("providerId");
  useEffect(() => {
    setModels(() => {
      const [data] = providers.filter(
        (provider) => provider.id === selectedProvider
      );

      if (!data) return [];

      return [...data.models];
    });
  }, [selectedProvider]);

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
      toast("Não foi possivel salvar a configuração da llm");
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
      toast("Não foi possivel criar o usuário!");
      return;
    }

    await router.invalidate();

    console.log("usuário criado com sucesso", user.userId);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Bem-vindo ao Project Wiz - Sua fabrica de software
          </h1>
          <p className="text-muted-foreground mt-2">
            Vamos configurar suas preferências para começar. Você pode alterar
            essas configurações a qualquer momento.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Essas informações serão usadas para commits no git e para como
                  o assistente se dirigirá a você.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-1 gap-4 items-center">
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem>
                        <div className="h-16 w-16 rounded-full overflow-hidden shadow-md m-5 border-4 border-b-muted">
                          <img
                            src={field.value}
                            alt={`Avatar de Usuário`}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                        <FormControl>
                          <Input type="url" hidden {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-1 flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="name">Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormDescription>
                            @{`${form.watch("username")}`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="seu.email@exemplo.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuração do Provedor LLM</CardTitle>
                <CardDescription>
                  Configure as definições do seu provedor LLM para alimentar
                  alimentar a fabrica.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token da API</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Seu token de API"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="providerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provedor LLM</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o provedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {providers.map((provider) => (
                              <SelectItem
                                key={provider.id}
                                value={`${provider.id}`}
                              >
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo LLM</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <FormControl>
                              <SelectValue placeholder="Selecione o modelo" />
                            </FormControl>
                          </SelectTrigger>
                          <SelectContent>
                            {models.map((model) => (
                              <SelectItem key={model.id} value={`${model.id}`}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full">
              Salvar Configuração
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
