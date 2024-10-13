"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { RepositoryConfig, repositoryConfigSchema } from "./schema";
import { saveRepositoryConfigAction } from "./actions";

export function RepositoryConfigForm({
  defaultValues,
  repository,
  budget_reserved,
  general_budget,
}: {
  defaultValues?: RepositoryConfig;
  repository: string;
  general_budget: number;
  budget_reserved: number;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const form = useForm<RepositoryConfig>({
    resolver: zodResolver(repositoryConfigSchema),
    defaultValues: {
      api_token: defaultValues?.api_token || "",
      is_batch_api: defaultValues?.is_batch_api || true,
      budget: defaultValues?.budget || 0.0,
    },
    reValidateMode: "onChange",
  });

  async function onSubmit(values: RepositoryConfig) {
    try {
      await saveRepositoryConfigAction(
        session!.user.username,
        repository,
        values
      );

      toast({
        description: "Configurações salvas com sucesso!",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Algo errado aconteceu!",
      });
    }
  }

  const budget = form.watch("budget");

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configurações do Repositório</CardTitle>
        <CardDescription>
          Esta configuração sobreescreve a configuração da conta.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="api_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI API Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Insira seu token da API OpenAI"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_batch_api"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Usa Batch API</FormLabel>
                    <FormDescription>
                      Ative para usar a API em lote, 50% de desconto.
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
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orçamento Mensal</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Insira seu orçamento"
                      className="flex-1"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        const rest_budget =
                          general_budget -
                          (budget_reserved - (defaultValues?.budget || 0.0));
                        if (value > rest_budget) {
                          form.setError("budget", {
                            type: "manual",
                            message: "O valor do orçamento extrapolado!",
                          });
                        } else {
                          field.onChange(value);
                          form.clearErrors("budget");
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Restante: ${" "}
                    {(
                      general_budget -
                      (budget_reserved - (defaultValues?.budget || 0.0)) -
                      budget
                    ).toFixed(2)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Salvar Configurações
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
