import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

type LLMModel = {
  id: string | number;
  name: string;
  slug: string;
};

type LLMProvider = {
  id: string | number;
  name: string;
  slug: string;
  models: LLMModel[];
};

function slugfy(text: string): string {
  if (typeof text !== "string") {
    return "";
  }

  let slug = text.toLowerCase();

  // 2. Remove acentos e caracteres diacríticos
  // Normaliza para decompor (ex: 'é' -> 'e', '\u0301')
  // Remove os caracteres diacríticos (intervalo Unicode \u0300-\u036f)
  slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 3. Substitui espaços e caracteres não-alfanuméricos por um hífen
  // [^a-z0-9] => Qualquer caractere que NÃO seja uma letra minúscula ou número
  // + => Corresponde a uma ou mais ocorrências do caractere anterior
  // g => Substitui todas as ocorrências
  slug = slug.replace(/[^a-z0-9]+/g, "-");

  // 4. Remove hifens do início e do fim da string
  // ^-+ => Um ou mais hifens no início da string
  // | => OU
  // -+$ => Um ou mais hifens no fim da string
  slug = slug.replace(/^-+|-+$/g, "");

  return slug;
}

export const Route = createFileRoute("/onbording/")({
  component: OnbordingPage,
  async loader() {
    const providers: { success: boolean; data: LLMProvider[] } =
      await window.api.invoke("query:llm-provider", {});
    console.log(providers, "providers");
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
  useEffect(() => {
    form.setValue(
      "avatar",
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`
    );
    form.setValue("username", slugfy(`${nickname}`));
  }, [nickname]);
  // const avatar = form.watch("avatar");

  const selectedProvider = form.watch("providerId");
  useEffect(() => {
    setModels(() => {
      const data =
        providers.data.find((provider) => provider.id === selectedProvider)
          ?.models || [];

      return [...data];
    });
  }, [selectedProvider]);

  const handleSubmit = async (data: FormType) => {
    console.log("Configuração salva", data);
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
                        <div className="h-16 w-16 rounded-full overflow-hidden shadow-md m-5">
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
                            {providers.data.map((provider) => (
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

function PersonaList() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  // Usando Dicebear API para gerar avatares
  const personas = [
    // Personas masculinas
    {
      id: "carlos",
      name: "Carlos",
      description:
        "Analítico e objetivo, sempre focado em fornecer informações precisas e diretas.",
      avatar:
        "https://api.dicebear.com/9.x/bottts/svg?seed=male1&backgroundColor=b6e3f4&radius=50",
      gender: "masculino",
      color: "blue",
    },
    {
      id: "pedro",
      name: "Pedro",
      description:
        "Amigável e paciente, explica conceitos complexos de forma simples e acessível.",
      avatar:
        "https://api.dicebear.com/9.x/bottts/svg?seed=male2&backgroundColor=c0aede&radius=50",
      gender: "masculino",
      color: "green",
    },
    {
      id: "rafael",
      name: "Rafael",
      description:
        "Criativo e inspirador, ajuda a pensar fora da caixa e encontrar soluções inovadoras.",
      avatar:
        "https://api.dicebear.com/9.x/bottts/svg?seed=male3&backgroundColor=d1d4f9&radius=50",
      gender: "masculino",
      color: "amber",
    },
    // Personas femininas
    {
      id: "ana",
      name: "Ana",
      description:
        "Metódica e detalhista, oferece explicações completas com exemplos práticos.",
      avatar:
        "https://api.dicebear.com/9.x/bottts/svg?seed=female1&backgroundColor=ffdfbf&radius=50&gender=female",
      gender: "feminino",
      color: "purple",
    },
    {
      id: "julia",
      name: "Julia",
      description:
        "Empática e colaborativa, foca em entender suas necessidades e oferecer suporte personalizado.",
      avatar:
        "https://api.dicebear.com/9.x/bottts/svg?seed=female2&backgroundColor=ffd5dc&radius=50&gender=female",
      gender: "feminino",
      color: "pink",
    },
    {
      id: "mariana",
      name: "Mariana",
      description:
        "Entusiasta e motivadora, incentiva a exploração de novas ideias e abordagens.",
      avatar:
        "https://api.dicebear.com/9.x/bottts/svg?seed=female3&backgroundColor=c0e8d5&radius=50&gender=female",
      gender: "feminino",
      color: "rose",
    },
  ];

  const getColorClass = (color: string, isSelected: boolean) => {
    const colorMap: Record<string, string> = {
      blue: isSelected ? "border-blue-500" : "hover:border-blue-300",
      green: isSelected ? "border-green-500 " : "hover:border-green-300",
      amber: isSelected ? "border-amber-500 " : "hover:border-amber-300",
      purple: isSelected ? "border-purple-500" : "hover:border-purple-300",
      pink: isSelected ? "border-pink-500 " : "hover:border-pink-300",
      rose: isSelected ? "border-rose-500 " : "hover:border-rose-300",
    };
    return (
      colorMap[color] ||
      (isSelected ? "border-primary" : "hover:border-primary/50")
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalidade do Assistente</CardTitle>
        <CardDescription>
          Escolha uma persona para seu assistente. Você pode personalizar ou
          alterar isso mais tarde.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna de personas masculinas */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Personas Masculinas</h3>
            <div className="space-y-4">
              {personas
                .filter((persona) => persona.gender === "masculino")
                .map((persona) => (
                  <div
                    key={persona.id}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all min-h-[124px] select-none
                     ${getColorClass(
                       persona.color,
                       selectedPersona === persona.id
                     )}`}
                    onClick={() => setSelectedPersona(persona.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full overflow-hidden shadow-md">
                          <img
                            src={persona.avatar || "/placeholder.svg"}
                            alt={`Avatar de ${persona.name}`}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{persona.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {persona.description}
                        </p>
                      </div>
                      {selectedPersona === persona.id && (
                        <div className="absolute right-4 top-4 h-5 w-5 text-primary">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Coluna de personas femininas */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Personas Femininas</h3>
            <div className="space-y-4">
              {personas
                .filter((persona) => persona.gender === "feminino")
                .map((persona) => (
                  <div
                    key={persona.id}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all min-h-[124px] select-none
                    ${getColorClass(
                      persona.color,
                      selectedPersona === persona.id
                    )}`}
                    onClick={() => setSelectedPersona(persona.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full overflow-hidden shadow-md">
                          <img
                            src={persona.avatar || "/placeholder.svg"}
                            alt={`Avatar de ${persona.name}`}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{persona.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {persona.description}
                        </p>
                      </div>
                      {selectedPersona === persona.id && (
                        <div className="absolute right-4 top-4 h-5 w-5 text-primary">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Você pode alterar ou personalizar essas configurações a qualquer
          momento no menu de preferências.
        </p>
      </CardFooter>
    </Card>
  );
}
