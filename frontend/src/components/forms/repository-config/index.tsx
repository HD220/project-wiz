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
import { useToast } from "@/hooks/use-toast";
import { RepositoryConfig, repositoryConfigSchema } from "./schema";
import { saveRepositoryConfigAction } from "@/actions/repository.actions";

export function RepositoryConfigForm({
  defaultValues,
}: {
  defaultValues?: RepositoryConfig;
}) {
  const { toast } = useToast();
  const form = useForm<RepositoryConfig>({
    resolver: zodResolver(repositoryConfigSchema),
    defaultValues: {
      ...(defaultValues || {}),
    },
    reValidateMode: "onChange",
  });

  async function onSubmit(values: RepositoryConfig) {
    try {
      await saveRepositoryConfigAction(values.id, values.owner, values);

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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configurações do Repositório</CardTitle>
        <CardDescription>
          Defina configuração especifica para esse repositório.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div>{JSON.stringify(form.formState.errors)}</div>
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
